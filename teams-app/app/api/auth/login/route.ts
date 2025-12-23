import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import crypto from "crypto"
import { createSession, generateRefereshToken } from "@/lib/auth/session";
import { signAccessToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest){
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

    return NextResponse.json({
        accessToken,
        refereshToken
    })
}

