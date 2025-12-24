import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Team } from "@/models/Team";
import { getAuthContext } from "@/lib/auth/context";
import { requireTeamAdmin } from "@/lib/team/permissions";

export async function POST(req: NextRequest){
    try{

        await dbConnect()
        const { userId } = getAuthContext(req)
        const { teamId, memberId } = await req.json()

        const team = await requireTeamAdmin(teamId, userId)

        if(!team){
            return NextResponse.json({
                error: "Not ADMIN"
            }, {status: 403})
        }

        await Team.updateOne(
            { _id: teamId },
            {
                $addToSet: {
                    members: {
                        userId: memberId,
                    }
                }
            })

            return NextResponse.json({
                success: true,
                message: "Team member added successfully"
            })

    }catch(error){
        console.group(error)
        return NextResponse.json({
            error: "Internal server error ehil adding members"
        }, {status: 500})
    }
}