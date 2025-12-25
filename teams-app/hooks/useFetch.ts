"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { refreshAccessToken } from "@/lib/auth/refresh" // Fixed typo here

export function useFetch(){
    const { accessToken, setAccessToken } = useAuth()
    const router = useRouter()

    return async function fetchWithAuth(
        url: string,
        options: Omit<RequestInit, "body"> & { body?: any } = {},
        retry: boolean = true
    ): Promise<Response> {
        
        // 1. Prepare Headers (Standard Logic)
        const headers = new Headers(options.headers)

        if(!(options.body instanceof FormData)){
            headers.set("Content-Type", "application/json")
        }

        console.log(accessToken)

        if(accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        // 2. Prepare Body
        let body = options.body
        if(body && typeof body !== "string" && !(body instanceof FormData)){
            body = JSON.stringify(body)
        }

        // 3. Initial Fetch
        const response = await fetch(url, {
            ...options,
            headers,
            body
        })



        // 4. Handle 401 (Token Expiry)
        if(response.status === 401 && retry){
            try{
                // A. Get the new token from backend (Cookie is sent automatically)
                const newData = await refreshAccessToken()
                
                // B. Update Context (For FUTURE requests/renders)
                setAccessToken(newData.accessToken)

                // C. CRITICAL FIX: Manually rebuild the retry request with the NEW token
                // We cannot use 'accessToken' variable here; it is still stale!
                const retryHeaders = new Headers(options.headers);
                
                if(!(options.body instanceof FormData)){
                    retryHeaders.set("Content-Type", "application/json")
                }
                
                // Inject the NEW token directly
                retryHeaders.set("Authorization", `Bearer ${newData.accessToken}`);

                return fetch(url, {
                    ...options,
                    headers: retryHeaders,
                    body // Body is already processed or raw, safe to reuse
                })

            }catch(error){
                // If refresh fails, log out
                setAccessToken(null)
                router.push("/login")
                throw new Error("Session Expired")
            }
        }

        // 5. General Error Handling
        if(!response.ok){
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Request failed");
        }

        return response
    }
}