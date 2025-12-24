import { NextRequest, NextResponse } from "next/server";
import { Team } from "@/models/Team";
import dbConnect from "@/lib/db";
import { getAuthContext } from "@/lib/auth/context";

export async function POST(req: NextRequest){
    try{
        
        await dbConnect()
        const { userId } = getAuthContext(req)
        const { name } = await req.json()

        const team = await Team.create({
            name,
            ownerId: userId,
            members: [{
                userId,
                role: "ADMIN"
            }]
        })

        await NextResponse.json({
            team
        })

    }catch(error){
        return NextResponse.json({
            error:"Internal server error in creating teams" 
        }, {status: 500})
    }
} 