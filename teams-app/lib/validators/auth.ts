import { z } from "zod"

export const loginSchema = z.object({
    email: z.email("Please provide a valid email address"),
    password: z.string().min(6, "Password must be atleast 6 characters").max(100,"Password is too long")
})

export type LoginInput = z.infer<typeof loginSchema>

