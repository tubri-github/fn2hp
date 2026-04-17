// Institution blurb data - text from Word documents, images from assets
import blurbData from './institutionBlurbs.json'

// Dynamically import all hero images from assets/institutions
const heroModules = import.meta.glob('@/assets/institutions/*_hero.{jpg,png}', { eager: true })

// Build a map: slug_hero.ext -> resolved URL
const heroMap = {}
for (const [path, mod] of Object.entries(heroModules)) {
  const filename = path.split('/').pop()
  heroMap[filename] = mod.default
}

// Dynamically import all inline images (numbered: code_0.jpg, code_1.jpg, etc.)
const inlineModules = import.meta.glob('@/assets/institutions/*_[0-9].{jpg,png}', { eager: true })

// Build a map: slug -> [url0, url1, ...]
const inlineMap = {}
for (const [path, mod] of Object.entries(inlineModules)) {
  const filename = path.split('/').pop()
  // e.g. "ams_0.jpg" -> slug "ams", index 0
  const match = filename.match(/^(.+)_(\d+)\.\w+$/)
  if (match) {
    const slug = match[1]
    const idx = parseInt(match[2])
    if (!inlineMap[slug]) inlineMap[slug] = []
    inlineMap[slug][idx] = mod.default
  }
}

/**
 * Get blurb data for an institution code
 * @param {string} code - Institution code (e.g. 'AM', 'USNM')
 * @returns {{ paragraphs: string[], heroImage: string|null, images: string[] } | null}
 */
export function getInstitutionBlurb(code) {
  const data = blurbData[code]
  if (!data) return null

  // Try multiple slug patterns for inline images
  const codeLower = code.toLowerCase()
  const heroPrefix = data.heroImage ? data.heroImage.replace(/_hero\.\w+$/, '') : null
  // Also try all slugs that start with the code (e.g. AM -> ams)
  const fuzzyMatch = Object.keys(inlineMap).find(slug => slug.startsWith(codeLower) && !inlineMap[codeLower])
  const images = inlineMap[codeLower] || (heroPrefix && inlineMap[heroPrefix]) || (fuzzyMatch && inlineMap[fuzzyMatch]) || []

  return {
    paragraphs: data.paragraphs,
    heroImage: data.heroImage ? (heroMap[data.heroImage] || null) : null,
    images: images.filter(Boolean)
  }
}

/**
 * Check if an institution has blurb data
 */
export function hasInstitutionBlurb(code) {
  return !!blurbData[code]
}
