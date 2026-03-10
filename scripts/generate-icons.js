/**
 * Genera iconos PWA (192x192 y 512x512) desde un SVG base.
 * Ejecutar: node scripts/generate-icons.js
 * Requiere: npm install sharp --save-dev
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0c0a09"/>
  <path fill="#10b981" d="M256 96c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 160c-53 0-96 43-96 96v160h192V352c0-53-43-96-96-96z"/>
  <circle cx="180" cy="200" r="24" fill="#14b8a6"/>
  <circle cx="332" cy="200" r="24" fill="#14b8a6"/>
</svg>
`

async function main() {
  try {
    const sharp = (await import('sharp')).default
    const outDir = path.join(__dirname, '..', 'public', 'icons')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

    const sizes = [192, 512]
    for (const size of sizes) {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(path.join(outDir, `icon-${size}.png`))
      console.log(`Creado icon-${size}.png`)
    }
  } catch (e) {
    console.warn('Instala sharp: npm install sharp --save-dev')
    console.warn('O añade iconos manualmente en public/icons/icon-192.png y icon-512.png')
  }
}

main()
