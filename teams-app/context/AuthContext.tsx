"use client"

import { createContext, useContext, ReactNode, useState } from "react"

interface AuthContextType {
    accessToken: string | null,
    setAccessToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children } : {children: ReactNode}){
    const [accessToken, setAccessToken] = useState<string | null>(null)

    return (
        <AuthContext.Provider value={{accessToken, setAccessToken}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if(context === undefined){
        throw new Error("useAuth ,ust be within an AuthProvider")
    }

    return context
}