"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { refereshAccessToken } from "@/lib/auth/refresh"

export function useFetch(){
    const { accessToken, setAccessToken } = useAuth()
    const router = useRouter()

    return async function fetchWithAuth(
        url: string,
        options: Omit<RequestInit, "body"> & { body?: any } = {},
        retry: boolean = true
    ): Promise<Response> {
        const headers = new Headers(options.headers)

        if(!(options.body instanceof FormData)){
            headers.set("Content-Type", "application/json")
        }

        if(accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        let body = options.body
        if(body && typeof body !== "string" && !(body instanceof FormData)){
            body = JSON.stringify(body)
        }

        const response = await fetch(url, {
            ...options,
            headers,
            body
        })

        if(response.status === 401 && retry){
            try{
                const data = await refereshAccessToken()
                setAccessToken(data.accessToken)

                return fetchWithAuth(url, options, false)
            }catch{
                setAccessToken(null)
                router.push("/login")
                throw new Error("Session Expired")
            }
        }

        if(!response.ok){
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Request failed");
        }

        return response
    }

}