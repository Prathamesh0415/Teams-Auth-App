import { NextResponse, NextRequest } from "next/server";
import { deleteAllSessions } from "@/lib/auth/session";
import { getAuthContext } from "@/lib/auth/context";
import { logAuditEvent } from "@/lib/audit/logger";

export async function POST(req: NextRequest){
    try {
        const { userId } = getAuthContext(req)

        await deleteAllSessions(userId)

        try {
            await logAuditEvent({
                userId,
                action: "LOGOUT_ALL",
            });
        } catch (auditError) {
            console.error("Logout-all audit logging failed:", auditError);
        }

        return NextResponse.json({
            success:true,
            message: "logged out from all device"
        })

    } catch (error) {
        console.error("Logout-all error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}