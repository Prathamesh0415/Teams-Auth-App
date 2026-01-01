"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Youtube, 
  Link as LinkIcon, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Clock,
  Trash2,
  Loader2
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import { ScrollArea } from "@/components/ui/8bit/scroll-area";
import { Separator } from "@/components/ui/8bit/separator";
import {
  Card,
  CardContent,
} from "@/components/ui/8bit/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/8bit/pagination";
import { useFetch } from "@/hooks/useFetch";

export default function MySummariesPage() {
  // In a real app, you would fetch data here using useEffect or a Server Component
  //const [summaries, setSummaries] = useState(MOCK_SUMMARIES);

    const fetchWithAuth = useFetch();

    const [summaries, setSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchSummaries() {
      setLoading(true);
      try {
        // Pass the currentPage to the API
        const res = await fetchWithAuth(`/api/protected/my-summaries?page=${currentPage}&limit=5`);
        const json = await res.json();

        if (res.ok) {
          setSummaries(json.data);
          // Update total pages from API response
          setTotalPages(json.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to load summaries", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: Scroll to top of list when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background font-mono p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Archive</h1>
            <p className="text-muted-foreground mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <Button variant="outline" className="border-2 border-black">
            Export All
          </Button>
        </div>

        <Separator className="bg-black/20" />

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {summaries.map((item) => (
              <SummaryItem key={item._id} data={item} />
            ))}

            {summaries.length === 0 && (
              <div className="text-center py-20 border-4 border-dashed border-muted rounded-xl">
                <p className="text-muted-foreground">No summaries found.</p>
              </div>
            )}
          </div>
        )}

        {/* --- FIXED PAGINATION CONTROLS --- */}
{totalPages > 1 && (
  <div className="py-6 w-full  justify-between">
    <Pagination>
      <PaginationContent className="bg-background border-2 border-black p-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-center md:gap-5">
        
        {/* PREVIOUS BUTTON */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* PAGE INFO */}
        <PaginationItem>
          <span className="px-4 font-bold font-mono text-sm md:text-base whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>

        {/* NEXT BUTTON */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  </div>
)}

        
      </div>
    </div>
  );
}

// --- INDIVIDUAL EXPANDABLE CARD COMPONENT ---
function SummaryItem({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card 
      className={`border-2 border-black transition-all duration-300 overflow-hidden w-full
      ${isExpanded ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]'}`}
    >
      {/* HEADER ROW */}
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-start bg-background rounded-t-lg">
        
        {/* Title & Metadata Container - min-w-0 fixes the flex overflow issue */}
        <div className="flex-1 space-y-3 min-w-0 w-full"> 
          
          {/* Top Row: Badge + Title */}
          <div className={`flex gap-3 ${isExpanded ? 'flex-col items-start' : 'items-center'}`}>
            <div className="shrink-0">
              {data.type === 'video' ? (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-2 border-red-700 h-6">
                  <Youtube className="w-3 h-3 mr-1" /> Video
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-2 border-blue-700 h-6">
                  <LinkIcon className="w-3 h-3 mr-1" /> Article
                </Badge>
              )}
            </div>

            {/* Title: Toggles between truncate and wrap */}
            <h3 className={`font-bold text-lg leading-tight transition-all duration-200 break-words w-full
              ${isExpanded 
                ? 'whitespace-normal' 
                : 'truncate' 
              }`}
            >
              {data.title}
            </h3>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs text-muted-foreground w-full">
            <Link 
              href={data.url} 
              target="_blank" 
              className={`flex items-center hover:underline hover:text-primary transition-all duration-200
                ${isExpanded 
                  ? 'break-all whitespace-normal' 
                  : 'truncate max-w-[200px]' 
                }`}
            >
              <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
              {data.url}
            </Link>
            
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center text-black/60">
                <Calendar className="w-3 h-3 mr-1" /> {new Date(data.createdAt).toLocaleDateString()}
              </span>
              {data.length && (
                <span className="flex items-center text-black/60">
                  <Clock className="w-3 h-3 mr-1" /> {data.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <Button 
           onClick={() => setIsExpanded(!isExpanded)}
           variant={isExpanded ? "default" : "outline"}
           className="border-2 border-black min-w-[140px] shrink-0 mt-2 md:mt-0"
        >
           {isExpanded ? (
             <>Close <ChevronUp className="ml-2 w-4 h-4" /></>
           ) : (
             <>Read <ChevronDown className="ml-2 w-4 h-4" /></>
           )}
        </Button>
      </div>

      {/* EXPANDABLE CONTENT */}
      {isExpanded && (
        <>
          <Separator />
          <CardContent className="p-0 bg-muted/10 animate-in fade-in zoom-in-95 duration-200">
            {/* SCROLL AREA CONTAINER 
                1. h-[500px]: Sets a fixed height to force scrolling.
                2. w-full & max-w-full: Ensures it doesn't push parent width.
            */}
            <ScrollArea className="h-[500px] w-full p-6">
              <article className="prose prose-sm md:prose-base dark:prose-invert font-sans max-w-none w-full break-words">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 border-b-4 border-black pb-2 font-mono" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 font-mono" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed break-words" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1 my-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-1 my-4" {...props} />,
                    
                    // Code blocks: Force horizontal scroll if code is too long
                    pre: ({node, ...props}) => (
                      <div className="w-full overflow-x-auto my-4 rounded-lg border-2 border-black/20">
                         <pre className="p-4 bg-muted/50" {...props} />
                      </div>
                    ),
                    code: ({node, className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <code className={`${className} block min-w-full`} {...props}>{children}</code>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm border border-black/10" {...props}>
                          {children}
                        </code>
                      )
                    },

                    // Tables: Wrap in div to allow horizontal scroll
                    table: ({node, ...props}) => (
                      <div className="w-full overflow-x-auto my-6 border-2 border-black rounded-lg">
                        <table className="w-full text-left border-collapse" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => <th className="border-b-2 border-black bg-muted p-2 font-bold" {...props} />,
                    td: ({node, ...props}) => <td className="border-b border-black/20 p-2" {...props} />,
                    
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground my-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary underline break-all" {...props} />,
                  }}
                >
                  {data.summary}
                </ReactMarkdown>
                
                {/* Extra space at bottom for comfortable scrolling */}
                <div className="h-10"></div>
              </article>
            </ScrollArea>

            {/* Footer Action */}
            <div className="p-4 border-t-2 border-dashed border-black/20 flex justify-end bg-background/50 backdrop-blur-sm">
              <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Delete from History
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}