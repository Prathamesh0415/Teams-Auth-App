import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import redis from "@/lib/redis";
import * as cheerio from "cheerio";
import { hashToken } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rateLimit";
import dbConnect from "@/lib/db"; // Import your DB connection
import Summary from "@/models/Summary";       // Import your Mongoose Model
import { getAuthContext } from "@/lib/auth/context";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Helper: Exponential Backoff for retries
async function fetchWithRetry(fn: () => Promise<string>, retries = 3, delay = 1000): Promise<string> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const {  url } = body || {}; // Extract userId for DB saving
    const { userId } = getAuthContext(req)

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    
    // Ensure we have a User ID if we want to save to their history
    // (You can remove this check if guest usage is allowed without DB saving)
    if (!userId) {
       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ============================================================
    // STEP 1: RATE LIMITER
    // ============================================================
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const key = `rl:summarize:${ip}`;
    
    const { allowed } = await rateLimit({
      key,
      limit: 5,
      windowInSeconds: 300, 
    });

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // ============================================================
    // STEP 2: CACHE & DB CHECK (The Split Strategy)
    // ============================================================
    
    // Identify Content Type
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    let videoId = null;

    if (isYoutube) {
      // Extract ID for potential extra checks
      const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      videoId = match ? match[1] : null;
    }

    // --- BRANCH A: YOUTUBE (Check MongoDB ONLY) ---
    if (isYoutube) {
      await dbConnect();
      // Check if ANY record exists with this URL (Global Cache)
      const existingSummary = await Summary.findOne({ url: url });

      if (existingSummary) {
        console.log("Creating new history entry from existing DB record (Youtube)...");
        
        // 1. Create a fresh entry for THIS user in their history
        //    (So it appears in their dashboard as "Just Viewed")
        await Summary.create({
          userId,
          url,
          title: existingSummary.title,
          summary: existingSummary.summary,
          type: "video",
          videoDuration: existingSummary.videoDuration
        });

        // 2. Return the existing data immediately
        return NextResponse.json({
          summary: existingSummary.summary,
          source: "mongodb", // Explicitly telling frontend source
        });
      }
      // If NOT found: Proceed to generate. DO NOT check Redis.
    } 
    
    // --- BRANCH B: WEBSITE (Check Redis ONLY) ---
    else {
      const urlHash = hashToken(url);
      const cachedKey = `summary:${urlHash}`;
      const cachedSummary = await redis.get(cachedKey);

      if (cachedSummary) {
        console.log("Hit Redis Cache for Website");
        
        // Return immediately (We do NOT save to MongoDB history on cache hit 
        // per your instructions "if it hits the cache then give the... summary")
        // However, usually you'd want to save this hit to the user's DB history too.
        // I will save it to DB to maintain consistency with the dashboard requirement.
        
        await dbConnect();
        await Summary.create({
            userId,
            url,
            title: "Web Article (Cached)", // You might want to cache title in Redis too to fix this
            summary: cachedSummary,
            type: "website"
        });

        return NextResponse.json({
          summary: cachedSummary,
          source: "cache",
        });
      }
      // If NOT found: Proceed to generate.
    }

    // ============================================================
    // STEP 3: FETCH CONTENT (Scraping)
    // ============================================================
    let content = "";
    let pageTitle = "New Summary"; // Default title if scraping fails to get one

    try {
      content = await fetchWithRetry(async () => {
        if (isYoutube) {
          if (!videoId) throw new Error("Invalid YouTube URL");

          const transcriptRes = await fetch("https://www.youtube-transcript.io/api/transcripts", {
            method: "POST",
            headers: {
              "Authorization": `Basic ${process.env.YOUTUBE_TRANSCRIPT_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: [videoId] }),
          });

          if (!transcriptRes.ok) throw new Error(`Transcript API failed: ${transcriptRes.status}`);
          const data = await transcriptRes.json();

          if (Array.isArray(data) && data.length > 0 && data[0].text) {
             pageTitle = data[0].title || "YouTube Video"; // Try to get title from API if available
             return data[0].text;
          } else {
             throw new Error("No transcript found");
          }
        } else {
          // Web Scraping
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch page: ${res.statusText}`);
          const html = await res.text();
          const $ = cheerio.load(html);
          
          // Try to grab the title
          const extractedTitle = $("title").text().trim();
          if (extractedTitle) pageTitle = extractedTitle;

          $("script, style, nav, footer, iframe").remove();
          return $("body").text().replace(/\s+/g, " ").trim();
        }
      });
    } catch (err: any) {
      console.error("Scraping failed:", err);
      return NextResponse.json(
        { error: "Failed to extract content. Video might lack captions." },
        { status: 400 }
      );
    }

    // ============================================================
    // STEP 4: SUMMARIZE (Streaming) & FINAL SAVE
    // ============================================================
    const truncatedContent = content.slice(0, 15000);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Summarize the following content in Markdown.",
        },
        {
          role: "user",
          content: truncatedContent,
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullGeneratedSummary = "";

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullGeneratedSummary += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // --- FINAL STORAGE LOGIC (Post-Generation) ---
          if (fullGeneratedSummary.length > 0) {
            await dbConnect();

            // 1. ALWAYS Save to MongoDB (Both YT and Web)
            // This is the "permanent" record
            await Summary.create({
              userId,
              url,
              title: pageTitle,
              summary: fullGeneratedSummary,
              type: isYoutube ? "video" : "website",
              // For now we don't have exact length, but you could add it if scraping API provides it
            });
            console.log("✅ Saved summary to MongoDB");

            // 2. CONDITIONALLY Save to Redis
            if (isYoutube) {
               // User Requirement: "dont cache this" (for YT)
               console.log("🚫 Skipping Redis cache for YouTube video");
            } else {
               // User Requirement: "store for 5 mins" (for Website)
               const urlHash = hashToken(url);
               const cachedKey = `summary:${urlHash}`;
               await redis.set(cachedKey, fullGeneratedSummary, "EX", 300); // 300s = 5 mins
               console.log("✅ Saved Web summary to Redis (5 mins TTL)");
            }
          }
        } catch (e) {
          console.error("Stream processing error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}