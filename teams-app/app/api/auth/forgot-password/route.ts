import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import crypto from "crypto"
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest){
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] /*|| req.ip*/ || "unknown"
        
        const { allowed } = await rateLimit({
            key: `rl:forgot:ip:${ip}`,
            limit: 3,
            windowInSeconds: 300
        })
    
        if(!allowed){
            return NextResponse.json({
                error: "Too Many  Attempts. Please try again later"
            }, {status: 429})
        }
    
    await dbConnect()
    const { email } = await req.json()

    const user = await User.findOne({ email })

    if(!user){
        return NextResponse.json({
            message: "if user exists, reset link sent"
        })
    }

    const token = crypto.randomBytes(32).toString("hex")

    user.passwordResetToken = token
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000
    await user.save()

    //TODO: Reset pass email
    console.log("send the reset password email")

    return NextResponse.json({
        success: true,
        message: "reset link sent"
    })
}