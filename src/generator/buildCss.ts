import fs from 'fs'
import path from 'path'
import { safeId } from '../utils/safeId.js'
import type { FrameNode } from '../utils/extractFrames.js'
import type { PositionedNode } from '../utils/mapToFrames.js'

interface Style {  
  fontSize: number
  fontWeight: number
  fontFamily: string
  color: {r: number; g: number; b: number; a: number},
  letterSpacing: number
  lineHeightPx: number  
}

interface TextNode {
  id: string
  text: string
  position: {x: number; y: number}
  size: {width: number; height: number}
  style: Style
}

const rgba = (color: {r:number; g:number; b:number; a: number} | null) => {
  if(!color) return 'rgba(0,0,0,1)'
  const r = Math.round(color.r * (color.r <= 1 ? 255: 1))
  const g = Math.round(color.g * (color.g <= 1 ? 255: 1))
  const b = Math.round(color.b * (color.b <= 1 ? 255: 1))
  const a = color.a !== undefined ? color.a : 1
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export const buildCss = (frames: FrameNode[], textNodes: PositionedNode[]) => {
  let css = `
    body {position: relative; font-family: Inter, sans-serif;}\n
    .screen {position: relative; width: ${frames[0]?.size.width}px; height: ${frames[0]?.size.height}px; overflow: hidden; margin: 0 auto;}\n
  `
  for(const f of frames) {
    css += `.frame-${safeId(f.id)} {\n`
    css += ` position: absolute;\n`
    css += ` left: ${f.position.x}px;\n`
    css += ` top: ${f.position.y}px;\n`
    css += ` width: ${f.size.width}px;\n`
    css += ` height: ${f.size.height}px;\n`
    css += `}\n\n`
  }
  
  for (const node of textNodes) {
    css+= `.text-${safeId(node.id)} {\n`
    css+= `position: absolute; \n`
    
    if(node.relative) {
      css += ` left: ${node.relative.x}px;\n`
      css += ` top: ${node.relative.y}px;\n`
    }
    if(node.style.fontSize) css += `font-size: ${node.style.fontSize}px;\n`
    if(node.style.fontWeight) css += `font-weight: ${node.style.fontWeight};\n`
    if(node.style.fontFamily) css += `font-family: ${node.style.fontFamily}, sans-serif;\n`
    if(node.style.letterSpacing) css += `letter-spacing: ${node.style.letterSpacing}px;\n`
    if(node.style.lineHeightPx) css += `line-height: ${node.style.lineHeightPx}px;\n`
    if(node.style.color) css += `color: ${rgba(node.style.color)};\n`

    css+=`}\n\n`
  }

  const cssPath = path.join('output', 'styles.css')
  fs.writeFileSync(cssPath, css)
}