import { getGenAIClient } from './genaiClient.js'

interface InlineDataPart {
  inlineData?: { mimeType?: string; data?: string }
  text?: string
}

async function generateOneVariation(
  model: string,
  prompt: string,
  cadImageBase64: string,
  mimeType: string,
): Promise<string> {
  const client = getGenAIClient()

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: cadImageBase64 } },
        ],
      },
    ],
    config: {
      responseModalities: ['IMAGE'],
      temperature: 0.9,
    },
  })

  const parts = (response.candidates?.[0]?.content?.parts ?? []) as InlineDataPart[]
  for (const part of parts) {
    const data = part.inlineData?.data
    if (typeof data === 'string' && data.length > 0) {
      return data
    }
  }

  throw new Error('Nano Banana returned no image data in response')
}

export async function generateSectionImages(
  cadImageBase64: string,
  mimeType: string,
  prompt: string,
): Promise<string[]> {
  const MODEL = process.env.VERTEX_AI_MODEL ?? 'gemini-2.5-flash-image'

  // Nano Banana returns a single image per call, so run two in parallel for 2 variations.
  const results = await Promise.all([
    generateOneVariation(MODEL, prompt, cadImageBase64, mimeType),
    generateOneVariation(MODEL, prompt, cadImageBase64, mimeType),
  ])

  return results
}
