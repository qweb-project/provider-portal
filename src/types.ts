import { z } from "zod"
import { sanitizeHostname, isValidDomain } from '@/lib/utils'

export const registerSchema = z.object({
    mcpServerUrl: z
      .string()
      .transform((v) => sanitizeHostname(v))
      .refine((v) => isValidDomain(v), {
        message: 'Enter a valid domain like example.com',
      }),
    amount: z.number().min(0.0001, 'Minimum amount is 0.0001'),
  })
  
export type RegisterFormData = z.infer<typeof registerSchema>    