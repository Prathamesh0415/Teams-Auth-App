// lib/auth/refresh.ts

export async function refreshAccessToken() {
    // 1. Call the refresh endpoint
    // The browser AUTOMATICALLY includes the HttpOnly 'refreshToken' cookie
    const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    console.log(res)

    if (!res.ok) {
        throw new Error("Failed to refresh token");
    }

    // 2. Return the new access token (The cookie is updated automatically by the server)
    return res.json(); 
}