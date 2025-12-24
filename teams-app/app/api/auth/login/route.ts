import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import crypto from "crypto"
import { createSession, generateRefereshToken } from "@/lib/auth/session";
import { signAccessToken } from "@/lib/auth/jwt";
import { logAuditEvent } from "@/lib/audit/logger";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest){
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] /*|| req.ip*/ || "unknown"
    
    const { allowed } = await rateLimit({
        key: `rl:login:ip:${ip}`,
        limit: 5,
        windowInSeconds: 300
    })

    if(!allowed){
        return NextResponse.json({
            error: "Too Many Login Attempts. Please try again later"
        }, {status: 429})
    }

    await dbConnect()
    const { email, password } = await req.json()

    if(!email || !password){
        return NextResponse.json(
            {error: "Invalid credentials"},
            {status: 400}
        )
    }

    const user = await User.findOne({email})
    if(!user){
        return NextResponse.json(
            {error: "Invalid credentials"},
            {status: 401}
        )
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if(!isValid){
        
        await logAuditEvent({
            action: "LOGIN_FAILED",
            ip: req.headers.get("x-forwarded-for"),
            userAgent: req.headers.get("user-agent"),
            metadata: { email },
        });

        return NextResponse.json(
            {error: "Invalid credentials"},
            {status: 401}
        )
    }
    if(!user.emailVerified){
        return NextResponse.json(
            {error: "Email not verified"},
            {status: 403}
        )
    }

    const sessionId = crypto.randomUUID()
    const refereshToken = generateRefereshToken()

    await createSession({
        userId: user._id.toString(),
        sessionId,
        refereshToken,
        ip: req.headers.get("x-forwared-for") ?? "",
        userAgent: req.headers.get("user-agent") ?? ""
    })

    const accessToken = signAccessToken({
        userId: user._id.toString(),
        role: user.role,
        sessionId
    })

    await logAuditEvent({
        userId: user._id.toString(),
        action: "LOGIN_SUCCESS",
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent")
    })

    return NextResponse.json({
        accessToken,
        refereshToken
    })
}

