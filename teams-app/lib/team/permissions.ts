import { Team } from "@/models/Team";

export async function requireTeamAdmin(
    teamId: string,
    userId: string
){
    try{
        const team = await Team.findOne({
        _id: teamId,
        members: {
                $eleMatch: {
                    userId,
                    role: "ADMIN"
                }
            }
        })

        return team
    }catch(error){
        console.log("error in permissions function", error)
    }
    
}