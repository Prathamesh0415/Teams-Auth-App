"use client";

import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch"; // Update path if needed
import { useRouter } from "next/navigation";
import { Shield, User as UserIcon, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const authFetch = useFetch();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        // UPDATED CALL HERE:
        // 1st arg: URL
        // 2nd arg: Options (empty object if none)
        // 3rd arg: Retry (true)
        //const res = await authFetch("/api/protected/profile", {}, true);
        
        //const data = await res.json();
        //setUser(data.user);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []); 

  // ... (Rest of the JSX remains the same as previous response) ...
  
  // Just for completeness, here is the return block again:
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Profile</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-4 mt-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 mt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-bold">{user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Role Card */}
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Level</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-4 w-[100px] mt-2" />
              ) : (
                <div className="mt-2">
                   <Badge variant={user?.role === "ADMIN" ? "destructive" : "secondary"}>
                     {user?.role || "MEMBER"}
                   </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}