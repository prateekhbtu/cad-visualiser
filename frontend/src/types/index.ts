export interface Preferences {
  style: string
  vibe: string
  colorPalette: string[]
}

export interface ImageVariation {
  index: number
  imageBase64: string
  mimeType: string
}

export interface Section {
  name: string
  description: string
  viewpoint: string
}

export interface SectionResult extends Section {
  error?: boolean
  errorMessage?: string
  variations: ImageVariation[]
}

export interface GenerateResponse {
  success: boolean
  sections: SectionResult[]
}

export class ApiError extends Error {
  statusCode?: number
  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export type View = 'upload' | 'preferences' | 'results'

export interface PaletteDefinition {
  name: string
  colors: string[]
}

export const PALETTES: PaletteDefinition[] = [
  { name: 'Neutral Warm', colors: ['#F5F0EB', '#D9C9B8', '#A08060', '#5C3D2E', '#1A1A1A'] },
  { name: 'Cool Concrete', colors: ['#E8EAED', '#B0BAC4', '#6B7A8D', '#2E3A4A', '#0D1B2A'] },
  { name: 'Earthy Bold', colors: ['#F2E8D0', '#C9A96E', '#8B5E3C', '#4A2C1A', '#1C0F07'] },
]

export const STYLES = ['Modern', 'Minimalist', 'Industrial', 'Bohemian', 'Japandi', 'Art Deco'] as const
export const VIBES = [
  'Warm & Cozy',
  'Sleek & Professional',
  'Earthy & Natural',
  'Bold & Dramatic',
  'Light & Airy',
] as const
