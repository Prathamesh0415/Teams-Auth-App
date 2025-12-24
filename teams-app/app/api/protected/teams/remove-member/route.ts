import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";
import dbConnect from "@/lib/db";
import { Team } from "@/models/Team";
import { requireTeamAdmin } from "@/lib/team/permissions";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { userId } = getAuthContext(req);
        const { teamId, memberId } = await req.json();

        if (memberId === userId) {
            return NextResponse.json({
                error: "You cannot remove yourself via this endpoint"
            }, { status: 403 });
        }

        const team = await requireTeamAdmin(teamId, userId);
        
        if (!team) {
            return NextResponse.json({
                error: "Not an ADMIN"
            }, { status: 403 });
        }

        const targetMember = team.members.find(
            (m: any) => m.userId.toString() === memberId
        );

        if (!targetMember) {
            return NextResponse.json({
                error: "Member not found in team"
            }, { status: 404 });
        }

        if (["OWNER", "ADMIN"].includes(targetMember.role)) {
            return NextResponse.json({
                error: "Cannot remove an Owner or Admin. Demote them first."
            }, { status: 403 });
        }

        await Team.updateOne(
            { _id: teamId },
            { 
                $pull: { 
                    members: { userId: memberId } 
                } 
            }
        );

        return NextResponse.json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {
        console.error("Remove member error:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}