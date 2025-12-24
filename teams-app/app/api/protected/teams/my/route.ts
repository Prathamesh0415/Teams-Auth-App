import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { Team } from "@/models/Team";
import { getAuthContext } from "@/lib/auth/context";

export async function GET(req: NextRequest){
    try{
        await dbConnect()
        const { userId } = getAuthContext(req)
        const teams = await Team.find({
            "members.userId": userId
        })
        return NextResponse.json({teams})
    }catch(error){
        console.log(error)
        return NextResponse.json({
            error: "Internal server error in my teams"
        }, {status: 500})
    }
}