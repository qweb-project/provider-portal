import { z } from "zod"

export const registerSchema = z.object({
    mcpServerUrl: z.string().url('Please enter a valid MCP Server URL'),
    amount: z.number().min(0.0001, 'Minimum amount is 0.0001'),
  })
  
export type RegisterFormData = z.infer<typeof registerSchema>    