import { Hono } from 'hono'
import { z } from 'zod'
import { buildSectionPrompt, type Preferences } from '../services/promptBuilder.js'
import { detectSections, type Section } from '../services/sectionDetector.js'
import { generateSectionImages } from '../services/vertexai.js'

const MAX_FILE_BYTES = 15 * 1024 * 1024

const preferencesSchema = z.object({
  style: z.string().min(1),
  vibe: z.string().min(1),
  colorPalette: z.array(z.string()).min(1),
})

interface ImageVariation {
  index: number
  imageBase64: string
  mimeType: string
}

interface SectionResult extends Section {
  error?: boolean
  errorMessage?: string
  variations: ImageVariation[]
}

const generate = new Hono()

generate.get('/health', (c) =>
  c.json({
    status: 'ok',
    model: process.env.VERTEX_AI_MODEL ?? null,
    textModel: process.env.VERTEX_AI_TEXT_MODEL ?? 'gemini-2.5-flash',
  }),
)

generate.post('/generate', async (c) => {
  let formData: FormData
  try {
    formData = await c.req.formData()
  } catch (err) {
    return c.json(
      {
        success: false,
        error: `Validation error: invalid multipart body (${
          err instanceof Error ? err.message : 'unknown'
        })`,
      },
      400,
    )
  }

  const cadFile = formData.get('cadFile')
  const preferencesRaw = formData.get('preferences')

  if (!(cadFile instanceof File)) {
    return c.json(
      { success: false, error: 'Validation error: cadFile is required and must be a File' },
      400,
    )
  }
  if (cadFile.size > MAX_FILE_BYTES) {
    return c.json(
      { success: false, error: 'Validation error: cadFile exceeds 15MB limit' },
      400,
    )
  }
  if (typeof preferencesRaw !== 'string') {
    return c.json(
      { success: false, error: 'Validation error: preferences is required' },
      400,
    )
  }

  let preferences: Preferences
  try {
    const parsed = JSON.parse(preferencesRaw)
    preferences = preferencesSchema.parse(parsed) as Preferences
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
        : err instanceof Error
          ? err.message
          : 'invalid JSON'
    return c.json({ success: false, error: `Validation error: ${message}` }, 400)
  }

  const buffer = await cadFile.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = cadFile.type || 'application/octet-stream'

  let sections: Section[]
  try {
    console.log('[CAD Visualizer] Detecting sections...')
    sections = await detectSections(base64, mimeType)
    console.log(
      `[CAD Visualizer] Detected ${sections.length} sections: ${sections
        .map((s) => s.name)
        .join(', ')}`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('[CAD Visualizer] Section detection failed:', message)
    return c.json(
      {
        success: false,
        error: `Could not analyze the CAD drawing: ${message}`,
      },
      502,
    )
  }

  const settled = await Promise.allSettled(
    sections.map(async (section): Promise<SectionResult> => {
      console.log(`[CAD Visualizer] Rendering ${section.name}...`)
      const prompt = buildSectionPrompt(section, preferences)
      const images = await generateSectionImages(base64, mimeType, prompt)
      const variations: ImageVariation[] = images.slice(0, 2).map((imageBase64, i) => ({
        index: i + 1,
        imageBase64,
        mimeType: 'image/jpeg',
      }))
      return { ...section, variations }
    }),
  )

  const results: SectionResult[] = settled.map((outcome, idx) => {
    if (outcome.status === 'fulfilled') return outcome.value
    const section = sections[idx]
    const message = outcome.reason instanceof Error ? outcome.reason.message : 'render failed'
    console.error(`[CAD Visualizer] Failed to render ${section.name}: ${message}`)
    return { ...section, error: true, errorMessage: message, variations: [] }
  })

  return c.json({ success: true, sections: results })
})

export default generate
