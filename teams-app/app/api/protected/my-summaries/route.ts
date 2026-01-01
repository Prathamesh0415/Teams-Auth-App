import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Summary from "@/models/Summary";
import { getAuthContext } from "@/lib/auth/context";

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // 1. Extract Query Parameters
    const { searchParams } = new URL(req.url);
    const { userId } = getAuthContext(req)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // 2. Validation
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 3. Build the Database Query
    // We want to find summaries for THIS user
    const query: any = { userId: userId };

    // If search term exists, filter by Title (Case-insensitive regex)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // 4. Calculate Pagination
    const skip = (page - 1) * limit;

    // 5. Run Queries (Parallel for speed)
    // We need both the data and the total count for the UI pagination
    const [summaries, totalCount] = await Promise.all([
      Summary.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .select("-__v"), // Exclude internal version key, keep summary for expansion
      
      Summary.countDocuments(query),
    ]);

    // 6. Return Response
    return NextResponse.json({
      data: summaries,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error: any) {
    console.error("Fetch Summaries Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}