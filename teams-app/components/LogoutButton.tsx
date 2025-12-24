"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch"; 
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Shadcn UI

export function LogoutButton() {
  const { setAccessToken } = useAuth();
  const authFetch = useFetch(); 
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    
    try {
      // 1. Call API to invalidate session on server
      // We pass 'false' for retry: No point refreshing a token just to logout!
      await authFetch("/api/protected/auth/logout", { method: "POST" }, false);
    } catch (error) {
      console.error("Logout API failed:", error);
      // We explicitly ignore errors here. 
      // Even if the server fails to logout, we MUST clear the client state.
    } finally {
      // 2. ALWAYS clear local state and redirect, even if API failed
      setAccessToken(null);
      router.push("/login");
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="destructive" // Shadcn's built-in red style
      onClick={logout} 
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Logout
    </Button>
  );
}