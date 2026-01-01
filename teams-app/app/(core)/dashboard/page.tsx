import React from "react";
import {
  FileText,
  Clock,
  Zap,
  MoreVertical,
} from "lucide-react";

// 8bitcn Components
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/8bit/table";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      
      {/* Stats Overview */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Stat Card 1 */}
          <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Summaries</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">128</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          {/* Stat Card 2 */}
          <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42h</div>
              <p className="text-xs text-muted-foreground mt-1">~20 mins per summary</p>
            </CardContent>
          </Card>

          {/* Stat Card 3 */}
          <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Left</CardTitle>
              <Zap className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">850</div>
              <p className="text-xs text-muted-foreground mt-1">Renewing in 12 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent History</h3>
          <Button variant="outline" size="sm" className="border-2 border-black">View All</Button>
        </div>
        
        <div className="rounded-md border-2 border-muted bg-background">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-muted hover:bg-muted/20">
                <TableHead className="w-[400px]">Content Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Length</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Row 1 */}
              <TableRow className="border-b border-muted hover:bg-muted/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                       <span className="text-[10px] font-bold">YT</span>
                     </div>
                     <span className="truncate max-w-[250px]">Understanding React Server Components in 2025</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Video</Badge>
                </TableCell>
                <TableCell>Today, 10:23 AM</TableCell>
                <TableCell>12 mins</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {/* Row 2 */}
              <TableRow className="border-b border-muted hover:bg-muted/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                       <span className="text-[10px] font-bold">DOC</span>
                     </div>
                     <span className="truncate max-w-[250px]">The Future of AI Agents: A Comprehensive Guide</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Article</Badge>
                </TableCell>
                <TableCell>Yesterday</TableCell>
                <TableCell>5 mins</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {/* Row 3 */}
              <TableRow className="hover:bg-muted/10">
                 <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                       <span className="text-[10px] font-bold">YT</span>
                     </div>
                     <span className="truncate max-w-[250px]">Elden Ring: Shadow of the Erdtree Lore Explained</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Video</Badge>
                </TableCell>
                <TableCell>Jan 04, 2026</TableCell>
                <TableCell>45 mins</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}