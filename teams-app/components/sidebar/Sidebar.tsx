import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  BrainCircuit,
  Menu
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

// 1. The Menu Items (Reused in Mobile & Desktop)
export function SidebarNav() {
  return (
    <nav className="grid gap-2 p-4">
      <Button 
        variant="default" 
        className="w-full justify-start gap-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Button>
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 hover:bg-muted/50 hover:underline"
      >
        <FileText size={18} />
        My Summaries
      </Button>
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 hover:bg-muted/50 hover:underline"
      >
        <CreditCard size={18} />
        Billing
      </Button>
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 hover:bg-muted/50 hover:underline"
      >
        <Settings size={18} />
        Settings
      </Button>
    </nav>
  );
}

// 2. The Usage Card (Reused)
export function SidebarUsage() {
  return (
    <div className="p-4 border-t-4 border-muted bg-background mt-auto">
      <Card className="border-2 border-black shadow-none bg-muted/30">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Free Plan</CardTitle>
          <CardDescription className="text-xs">7/10 Summaries used</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Progress value={70} className="h-3 border-2 border-black" />
          <Button size="sm" variant="outline" className="w-full mt-4 text-xs h-8 border-black">
            Upgrade Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 3. Desktop Sidebar Component
export function DesktopSidebar({ className }: { className?: string }) {
  return (
    <aside className={`hidden md:flex w-72 flex-col border-r-4 border-muted bg-muted/20 ${className}`}>
      <div className="flex h-20 items-center gap-3 px-6 border-b-4 border-muted bg-background">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-sm border-2 border-black">
          <BrainCircuit size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight">Summ.AI</span>
      </div>

      <ScrollArea className="flex-1">
        <SidebarNav />
      </ScrollArea>

      <SidebarUsage />
    </aside>
  );
}

// 4. Mobile Sidebar (Drawer) Component
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