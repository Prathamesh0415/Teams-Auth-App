"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BrainCircuit,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";
import { ScrollArea } from "@/components/ui/8bit/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/8bit/sheet";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // <--- 1. Import Auth Context

// 1. The Menu Items (Updated to handle collapse state)
export function SidebarNav({ isCollapsed }: { isCollapsed?: boolean }) {
  // Helper to determine button classes based on collapse state
  const btnClass = `w-full gap-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
    isCollapsed ? "justify-center px-0" : "justify-start"
  }`;

  return (
    <nav className="grid gap-2 p-4">
      <Link href="/dashboard">
        <Button variant="default" className={btnClass} title="Dashboard">
          <LayoutDashboard size={18} />
          {!isCollapsed && <span>Dashboard</span>}
        </Button>
      </Link>
      
      <Link href="/my-summaries">
        <Button variant="default" className={btnClass} title="My Summaries">
          <FileText size={18} />
          {!isCollapsed && <span>My Summaries</span>}
        </Button>
      </Link>
      
      <Link href="/summarize">
        <Button variant="default" className={btnClass} title="Summarize">
          <Plus size={18} />
          {!isCollapsed && <span>Summarize</span>}
        </Button>
      </Link>
    </nav>
  );
}

// 2. The Usage Card (Updated with Dynamic Data)
export function SidebarUsage({ isCollapsed }: { isCollapsed?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isCollapsed) return null; 
  if (isLoading || !user) return null; 

  return (
    <div className="p-4 border-t-4 border-muted bg-background mt-auto">
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50/50">
        <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
          
          {/* Plan Badge */}
          <div className="bg-black text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest">
            {user.planName} Plan
          </div>

          {/* Big Credit Count */}
          <div className="py-2">
             <div className="text-5xl font-black text-black tracking-tighter">
                {user.credits}
             </div>
             <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                Credits Remaining
             </p>
          </div>
          
          {/* Action Button */}
          <Button 
            size="sm" 
            className="w-full h-9 border-2 border-black bg-white hover:bg-green-100 text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Get More Credits
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

// 3. Desktop Sidebar Component
interface DesktopSidebarProps {
  className?: string;
  isCollapsed: boolean;      
  toggleSidebar: () => void; 
}

export function DesktopSidebar({ className, isCollapsed, toggleSidebar }: DesktopSidebarProps) {
  return (
    <aside 
      className={`hidden md:flex flex-col border-r-4 border-muted bg-muted/20 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      } ${className}`}
    >
      {/* Header with Toggle Button */}
      <div className={`flex h-20 items-center border-b-4 border-muted bg-background px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        
        {/* Logo (Hide text if collapsed) */}
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-sm border-2 border-black shrink-0">
            <BrainCircuit size={20} />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">Summ.AI</span>
          )}
        </div>

        {/* The Toggle Button */}
        {!isCollapsed && (
           <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
             <ChevronLeft size={16} />
           </Button>
        )}
      </div>
      
      {/* If collapsed, show the expand button at the top */}
      {isCollapsed && (
         <div className="flex justify-center py-2 border-b-2 border-muted">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
               <ChevronRight size={16} />
            </Button>
         </div>
      )}

      <ScrollArea className="flex-1">
        <SidebarNav isCollapsed={isCollapsed} />
      </ScrollArea>

      <SidebarUsage isCollapsed={isCollapsed} />
    </aside>
  );
}

// 4. Mobile Sidebar
export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden border-2 border-black">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="h-20 flex items-center justify-center border-b-4 border-muted bg-background">
          <SheetTitle className="flex items-center gap-3">
            <BrainCircuit size={20} /> Summ.AI
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <SidebarNav />
        </ScrollArea>

        <SidebarUsage />
      </SheetContent>
    </Sheet>
  );
}