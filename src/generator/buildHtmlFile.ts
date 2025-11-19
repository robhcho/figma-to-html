import fs from 'fs'
import path from 'path'
import { buildHtml } from './buildHtml.js'
import { extractText } from '../utils/extractText.js'

const CACHE_PATH = './figmaCache.json'
const OUTPUT_DIR = './output'
const OUTPUT_HTML = path.join(OUTPUT_DIR, 'index.html')
const OUTPUT_CSS = path.join(OUTPUT_DIR, 'styles.css')

const main = () => {
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
  const root = raw.nodes['0:0'].document.children[0]

  const textNodes = extractText(root)
  const html = buildHtml(textNodes)

  if(!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR)

  // write index.html
  fs.writeFileSync(OUTPUT_HTML, html)
  
  // empty css file (will fill in later)
  if(!fs.existsSync(OUTPUT_CSS)) fs.writeFileSync(OUTPUT_CSS, '/* styles generated later */')
}

main()