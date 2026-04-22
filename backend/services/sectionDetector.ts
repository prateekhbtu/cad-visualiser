import { Type } from '@google/genai'
import { getGenAIClient } from './genaiClient.js'

export interface Section {
  name: string
  description: string
  viewpoint: string
}

const INSTRUCTION = `You are an architectural analyst examining a CAD drawing. It may be a residential floor plan, a commercial layout (office, retail, restaurant, hospitality), an elevation, a section, or a single-room sketch.

Identify 3 to 6 distinct spaces, zones, or focal areas that each deserve their own photorealistic render. Prefer fewer, well-chosen views over many shallow ones.

Rules for choosing sections:
- For multi-room floor plans: each functional space or zone (e.g., "Living Area", "Primary Bedroom", "Kitchen & Dining", "Entry Hall", "Workstation Cluster", "Dining Floor").
- For single-room sketches or elevations: pick complementary camera angles (e.g., "Entry-facing view", "Feature wall", "Window-side perspective").
- Name each section with a short, human-friendly label that a non-architect could understand.
- The description should be one plain-English sentence naming the key visible elements (furniture, fixtures, built-ins).
- The viewpoint should describe where the camera is standing and what direction it faces (e.g., "Standing at the north entry, facing the kitchen island").

Return ONLY valid JSON matching the schema. No prose outside the JSON.`

export async function detectSections(
  cadImageBase64: string,
  mimeType: string,
): Promise<Section[]> {
  const model = process.env.VERTEX_AI_TEXT_MODEL ?? 'gemini-2.5-flash'
  const client = getGenAIClient()

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: INSTRUCTION },
          { inlineData: { mimeType, data: cadImageBase64 } },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                viewpoint: { type: Type.STRING },
              },
              required: ['name', 'description', 'viewpoint'],
            },
          },
        },
        required: ['sections'],
      },
      temperature: 0.4,
    },
  })

  const text = response.text
  if (!text || text.trim().length === 0) {
    throw new Error('Section detector returned an empty response')
  }

  let parsed: { sections?: Section[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Section detector returned non-JSON output')
  }

  const sections = (parsed.sections ?? []).filter(
    (s) => s && typeof s.name === 'string' && s.name.trim().length > 0,
  )

  if (sections.length === 0) {
    throw new Error('No sections could be identified in the CAD drawing')
  }

  return sections.slice(0, 6)
}
