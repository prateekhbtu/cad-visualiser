import { GoogleGenAI } from '@google/genai'

let cachedClient: GoogleGenAI | null = null

export function getGenAIClient(): GoogleGenAI {
  if (cachedClient) return cachedClient

  const projectId = process.env.VERTEX_AI_PROJECT_ID
  const location = process.env.VERTEX_AI_LOCATION ?? 'us-central1'
  const clientEmail = process.env.VERTEX_AI_CLIENT_EMAIL
  const privateKeyRaw = process.env.VERTEX_AI_PRIVATE_KEY

  if (!projectId) throw new Error('VERTEX_AI_PROJECT_ID is not set')
  if (!clientEmail) throw new Error('VERTEX_AI_CLIENT_EMAIL is not set')
  if (!privateKeyRaw) throw new Error('VERTEX_AI_PRIVATE_KEY is not set')

  // Support both real newlines (from dotenv double-quoted parse) and literal "\n" sequences.
  const privateKey = privateKeyRaw.includes('\\n')
    ? privateKeyRaw.replace(/\\n/g, '\n')
    : privateKeyRaw

  cachedClient = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location,
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    },
  })

  return cachedClient
}
