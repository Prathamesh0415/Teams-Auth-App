export async function refereshAccessToken(){
    const res = await fetch("/api/auth/referesh", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include"
    })

    if(!res.ok){
        throw new Error("Refresh failed")
    }

    return res.json()

}
