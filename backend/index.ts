import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '..', '.env') })
loadEnv()

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import generateRoute from './routes/generate.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173' }))
app.route('/api', generateRoute)

serve(
  { fetch: app.fetch, port: Number(process.env.PORT) || 3001 },
  () => {
    console.log('[CAD Visualizer] Server running on http://localhost:3001')
  },
)

export default app
