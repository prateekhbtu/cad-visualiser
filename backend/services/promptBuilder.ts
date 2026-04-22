import type { Section } from './sectionDetector.js'

export interface Preferences {
  style: string
  vibe: string
  colorPalette: string[]
}

interface StyleMapping {
  scene: string
  materials: string
}

interface VibeMapping {
  atmosphere: string
  lighting: string
}

const STYLE_MAP: Record<string, StyleMapping> = {
  Modern: {
    scene:
      'contemporary open-plan interior with clean geometry, flush cabinetry, and integrated lighting',
    materials:
      'polished concrete floors, matte lacquered surfaces, brushed steel fixtures, floor-to-ceiling glass',
  },
  Minimalist: {
    scene:
      'sparse, light-filled interior with deliberate negative space and a curated selection of objects',
    materials: 'poured concrete, raw linen, bleached oak, matte white plaster walls',
  },
  Industrial: {
    scene:
      'raw loft-style interior with exposed structural elements and utilitarian character',
    materials:
      'exposed brick walls, oxidised steel beams, reclaimed timber, factory-glass pendant lights',
  },
  Bohemian: {
    scene: 'layered, eclectic interior rich with pattern, texture, and cultural artefacts',
    materials:
      'rattan furniture, handwoven textiles, terracotta tiles, brass and copper accents',
  },
  Japandi: {
    scene:
      'serene, nature-connected interior merging Japanese wabi-sabi and Scandinavian simplicity',
    materials:
      'natural ash wood, rice paper panels, tatami-inspired flooring, smooth plaster, ceramic vessels',
  },
  'Art Deco': {
    scene:
      'glamorous, geometry-forward interior with rich ornamentation and period drama',
    materials:
      'chevron parquet floors, lacquered ebony cabinetry, marble surfaces, gold fixtures, velvet upholstery',
  },
}

const VIBE_MAP: Record<string, VibeMapping> = {
  'Warm & Cozy': {
    atmosphere: 'intimate, hearthside warmth',
    lighting: 'warm golden-hour glow, soft bounce from wood surfaces, deep soft shadows',
  },
  'Sleek & Professional': {
    atmosphere: 'composed, purposeful, boardroom-caliber precision',
    lighting: 'cool diffused overhead light, even exposure, crisp shadows, blue-white daylight',
  },
  'Earthy & Natural': {
    atmosphere: 'biophilic, grounded, nature seeping through walls',
    lighting: 'dappled natural light filtered through foliage, soft green-ambient bounce',
  },
  'Bold & Dramatic': {
    atmosphere: 'high-contrast, editorial, gallery-worthy tension',
    lighting: 'strong directional light, deep shadow pools, theatrical highlights, low-key HDR',
  },
  'Light & Airy': {
    atmosphere: 'effortless, cloud-soft, resort morning clarity',
    lighting: 'overcast diffused light, near-shadowless, white bounce from pale surfaces',
  },
}

const LOCKED_GEOMETRY_BLOCK = `Transform the specified section of this architectural CAD drawing into a fully photorealistic cinematic render.
Preserve the geometry, spatial layout, furniture placement, and scale exactly as drawn in the CAD — do not reinterpret, reposition, add, or remove elements.
Remove all sketch lines, annotations, grid dots, dimensions, and text from the CAD completely.
Only enhance into realism. Do not invent content that is not visibly indicated in the CAD.`

function hexToDescriptor(hex: string): string {
  const normalized = hex.trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(normalized)) return normalized
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const saturation = max === 0 ? 0 : (max - min) / max

  let tone: string
  if (luminance < 0.12) tone = 'near-black'
  else if (luminance < 0.3) tone = 'deep'
  else if (luminance < 0.55) tone = 'mid'
  else if (luminance < 0.85) tone = 'soft'
  else tone = 'warm off-white'

  if (saturation < 0.12) {
    const neutral =
      luminance < 0.12
        ? 'near-black'
        : luminance < 0.3
          ? 'deep charcoal'
          : luminance < 0.55
            ? 'taupe grey'
            : luminance < 0.85
              ? 'pale stone'
              : 'warm off-white'
    return `${neutral} (${normalized})`
  }

  let hue: string
  if (r >= g && g >= b) {
    hue = r - g > 40 ? 'terracotta' : 'warm tan'
  } else if (r >= b && b >= g) {
    hue = 'dusty rose'
  } else if (g > r && g >= b) {
    hue = b > r ? 'sage' : 'olive'
  } else if (b > r && b >= g) {
    hue = r > g ? 'slate blue' : 'deep indigo'
  } else {
    hue = 'muted hue'
  }

  return `${tone} ${hue} (${normalized})`
}

function paletteToNaturalLanguage(colors: string[]): string {
  if (colors.length === 0) return 'a neutral off-white and charcoal base'
  return colors.map(hexToDescriptor).join(', ')
}

export function buildSectionPrompt(section: Section, preferences: Preferences): string {
  const style = STYLE_MAP[preferences.style] ?? STYLE_MAP.Modern
  const vibe = VIBE_MAP[preferences.vibe] ?? VIBE_MAP['Warm & Cozy']
  const paletteText = paletteToNaturalLanguage(preferences.colorPalette)

  const dynamicBlock = `Section: ${section.name}.
Section overview: ${section.description}
Viewpoint: ${section.viewpoint}.
Scene: ${style.scene}
Materials: ${style.materials}
Lighting: ${vibe.lighting}
Atmosphere: ${vibe.atmosphere}, color palette featuring ${paletteText}.
Details: ultra-detailed textures (wood grain, fabric weave, stone roughness), realistic reflections on glass, physically accurate materials, depth of field very subtle, no distortion.
Style: photorealistic interior photography, 35mm lens, eye-level perspective, HDR, Unreal Engine / V-Ray quality, 8K detail.
Output: a clean photograph with NO text, captions, watermarks, numbers, or overlay graphics anywhere in the image — the image itself should be pure photography. Labels will be added separately in the UI.`

  return `${LOCKED_GEOMETRY_BLOCK}\n\n${dynamicBlock}`
}
