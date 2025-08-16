import { serve } from '@hono/node-server'
import app from './src/api/server'

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
}) 