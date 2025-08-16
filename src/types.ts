import { z } from "zod"

export const registerSchema = z.object({
    mcpServerUrl: z.string().min(1, 'Please enter a valid Website URL'),
    amount: z.number().min(0.0001, 'Minimum amount is 0.0001'),
  })
  
export type RegisterFormData = z.infer<typeof registerSchema>    