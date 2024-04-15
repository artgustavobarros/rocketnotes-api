import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
})

const response = envSchema.safeParse(process.env)

if (!response.success) {
  console.error('Invalid environment variables.', response.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = response.data
