import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";
import dbConnect from "@/lib/db";
import { Team } from "@/models/Team";
import { requireTeamAdmin } from "@/lib/team/permissions";

export async function POST(req: NextRequest){
    try{
        await dbConnect()
        const { userId } = getAuthContext(req)
        const { teamId, memberId, role } = await req.json()
        if(memberId === userId){
            return NextResponse.json({
                error: "Cant change you own status"
            }, {status: 403})
        }
        const team = await requireTeamAdmin(teamId, userId)
        if(!team){
            return NextResponse.json({
                error: "Not an ADMIN"
            }, {status: 403})
        }
        const updateResult = await Team.updateOne({
            _id: teamId,
            "members.userId": memberId
        }, {
            $set: {"members.$.role": role || "ADMIN"}
        })

        if (updateResult.matchedCount === 0) {
             return NextResponse.json({ error: "Member not found in team" }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            messsage: "member updated successfully ?"
        })


    }catch(error){  
        console.log(error)
        return NextResponse.json({
            error: "Internal server error while updating member status"
        }, {status: 500})
    }
}