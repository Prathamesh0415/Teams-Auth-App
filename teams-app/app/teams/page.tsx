"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch"; // Import the hook
import { Loader2, Plus } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeamsPage() {
  // 1. Initialize the hook
  const authFetch = useFetch();
  
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      // 2. USE THE HOOK
      // Note: We pass the object directly as 'body'. The hook handles stringifying.
      // Note: We pass 'true' as the 3rd argument to enable auto-refresh retry.
      const res = await authFetch(
        "/api/protected/teams/create",
        {
          method: "POST",
          body: { name }, // Pass object directly
        },
        true // Retry = true
      );

      if (!res.ok) {
        // The hook throws for network errors, but we still check for API errors
        const data = await res.json();
        throw new Error(data.error || "Failed to create team");
      }

      setStatus({ type: 'success', msg: "Team created successfully!" });
      setName(""); // Reset form
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
          <CardDescription>
            Give your team a name to get started.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={createTeam}>
          <CardContent className="space-y-4">
            {/* Status Messages */}
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}