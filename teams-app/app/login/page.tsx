"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

// UI Components
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

// NEW IMPORTS
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators/auth";

export default function LoginPage() {
  const { setAccessToken, accessToken } = useAuth(); // Keeping your original context structure
  const router = useRouter();
  
  // We keep your manual loading/error states since you wanted minimal changes elsewhere
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting }, // We can use RHF's submitting state too
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && accessToken) {
      router.replace("/dashboard");
    }
  }, [isLoading, accessToken, router]);

  // 2. Updated Login Function (receives data from RHF)
  async function handleLogin(data: LoginInput) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Use data from RHF directly
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Login failed");
      }

      setAccessToken(responseData.accessToken);
      router.push("/dashboard");
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        {/* 3. Wrap handleLogin in handleSubmit */}
        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                // 4. Register input with Zod
                {...register("email")}
                // 5. Add visual error state
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {/* 6. Display Zod error message */}
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            {/* Disable if either our manual loading state OR RHF submitting state is true */}
            <Button className="w-full" type="submit" disabled={isLoading || isFormSubmitting}>
              {isLoading || isFormSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}