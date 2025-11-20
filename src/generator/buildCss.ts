import fs from 'fs'
import path from 'path'
import { safeId } from '../utils/safeId.js'
import type { FrameNode } from '../utils/extractFrames.js'
import type { PositionedNode, PositionedRect, PositionedText } from '../utils/mapToFrames.js'

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

// ==== Helpers ====
const rgba = (color: {r:number; g:number; b:number; a: number} | null) => {
  if(!color) return 'rgba(0,0,0,1)'
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const a = color.a !== undefined ? color.a : 1
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const gradientToCSS = (fill: any | null) => {
  if(!fill || !fill.gradientStops) return ''

  const stops = fill.gradientStops.map((stop: any) => {
    const color = rgba(stop.color)
    const pos = (stop.position ?? 0) * 100
    return `${color} ${pos}%`
  })

  let angle = 90
  const handles = fill.gradientHandlePositions
  if(handles && handles.length >= 2) {
    const [p0, p1] = handles
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const rad = Math.atan2(dy, dx)
    angle = (rad * 180) / Math.PI
  }

  return `linear-gradient(${angle}deg, ${stops.join(', ')})`
}

const cornerRadiusToCss = (node: {cornerRadius?: number; rectangleCornerRadii?: number[] }) => {
  if(typeof node.cornerRadius === 'number') return `${node.cornerRadius}px`

  if(Array.isArray(node.rectangleCornerRadii)) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii
    return `${tl}px ${tr}px ${br}px ${bl}px`
  }
  return null
}

const dropShadowToCss = (effects: any[] | undefined) => {
  if(!effects) return null
  const shadow = effects.find(e => e.type === 'DROP_SHADOW')
  if(!shadow) return null
  const color = rgba(shadow.color)
  const {x, y} = shadow.offset || {x: 0, y: 0}
  const blur = shadow.radius ?? 0
  const spread = shadow.spread ?? 0
  return `${x}px ${y}px ${blur}px ${spread}px ${color}` 
}

const isInLayout = (id:string, frameMap: any, frames: FrameNode[]): boolean => {
  for(const fid in frameMap) {
    const frame = frames.find(f => f.id === fid)
    if(!frame?.layoutMode) continue
    if(frameMap[fid].texts.some((t: any) => t.id === id)) return true
    if(frameMap[fid].rects.some((r:any) => r.id === id)) return true
  }
  return false
}

const inInputGroup = (node: any, frameMap: any): boolean => {
  for (const fid in frameMap) {
    const group = frameMap[fid]
    if(group.rects.length >= 2 && group.rects.some((r:any) => r.stroke)) {
      if(group.rects.some((r:any) => r.id === node.id)) return true
    }
  }
  return false
}

const isInputFrame = (f: FrameNode, frameMap: any): boolean => {
  const group = frameMap[f.id]
  if(!group) return false
  if(!group.rects || group.rects.length < 2) return false
  
  const hasStroke = group.rects.some((r:any) => r.stroke)
  if(!hasStroke) return false

  const hasText = group.texts && group.texts.length >= 1
  if(!hasText) return false
  return true
}
 

export const buildCss = (
  frames: FrameNode[], 
  frameMap: Record<string, {texts: PositionedText[]; rects: PositionedRect[]}>
) => {
  const frameParents: Record<string, boolean> = {}
  for(const parent of frames) {
    if(!parent.layoutMode) continue
    for(const child of parent.children) {
      frameParents[child] = true
    }
  }
  
  let css = `
    body {position: relative; font-family: Inter, sans-serif;}\n
    .screen {position: relative; width: ${frames[0]?.size.width}px; height: ${frames[0]?.size.height}px; overflow: hidden; margin: 0 auto;}\n
  `
  // ****** FRAME STYLES *******
  for(const f of frames) {        
    const nested = frameParents[f.id] === true
    const isInput = isInputFrame(f, frameMap)
    
    css += `.frame-${safeId(f.id)} {\n`
    if(!nested) {
      css += ` position: absolute;\n`
      css += ` left: ${f.position.x}px;\n`
      css += ` top: ${f.position.y}px;\n`
      css += ` width: ${f.size.width}px;\n`
      css += ` height: ${f.size.height}px;\n`    
    } else {
      css += ` position: relative;\n`      
      css += ` height: auto;\n`    

    }
    if(isInput) {
      css += ` min-height: ${f.size.height}px; height: auto;\n`
      css += ` width: 100%;\n`
      css += ` left: 0;\n`
      css += ` padding-left: 32px;\n`
      css += ` padding-right: 32px;\n`
    } 
    
    // ---- background ----    
    const fill = f.fills?.[0]
    if(fill) {
      if(fill.type === 'SOLID' && fill.color) {
        css += ` background-color: ${rgba(fill.color)};\n`
      } else if (fill.type && String(fill.type).startsWith('GRADIENT')) {
        const gradCss = gradientToCSS(fill)
        if(gradCss) css += ` background-image: ${gradCss};\n`
      }
    } 
    
    // ---- borders/radii ----
    
    const radiusCss = cornerRadiusToCss(f)
    if(radiusCss) css += ` border-radius: ${radiusCss};\n`    
    if(f.strokes && f.strokes[0]) css += ` border: ${f.strokeWeight ?? 1}px solid ${rgba(f.strokes[0].color)};\n`
    
    
    // ---- shadow ----
  
    const shadowCss = dropShadowToCss(f.effects)
    if(shadowCss) css += ` box-shadow: ${shadowCss};\n`
    
    
    // if(f.clipContent) css += ` overflow: hidden;\n`
    
    // ---- layout ----
    if(f.layoutMode) {
      css += ` display: flex;\n`
      css += ` flex-direction: ${f.layoutMode === 'HORIZONTAL' ? 'row' : 'column'};\n`      
      if(!isInput) {
        css += ` padding: ${f.padding.top}px ${f.padding.right}px ${f.padding.bottom}px ${f.padding.left}px;\n`      
      }
      if(typeof f.itemSpacing === 'number') css += ` gap: ${f.itemSpacing}px;\n`      
      
      if(isInput) {
        css += ` background:none; border:none; border-radius: 0; box-shadow:none;\n`
      }      
    }
    
    css += `}\n\n`
  }
  
  
  // ****** Text & Rect *******
  for (const id in frameMap) {
    const group = frameMap[id]
    if(!group) continue
    const {texts, rects} = group

    // ---- text ----
    for(const node of texts) {      
      const inLayout = isInLayout(node.id, frameMap, frames)

      const parentWithStroke = Object.values(frameMap).some(group => 
        group.rects.some(r => r.stroke && r.id === node.id.replace(/_text.*/, ''))
      )
      
      css+= `.text-${safeId(node.id)} {\n`
      if(!inLayout) {
        css+= ` position: absolute; \n` 
        css += ` left: ${node.relative.x}px;\n`
        css += ` top: ${node.relative.y}px;\n`
      } else {
        css+= ` position: relative; \n` 
        css+= ` display: flex; width: 100%; height: 100%;\n`
        if(parentWithStroke) css += `justify-content: flex-start; align-items: center; padding-left:8px;\n`
        else css += ` justify-content: center; align-items:center;\n`
      }
      if(node.style.fontSize) css += `font-size: ${node.style.fontSize}px;\n`
      if(node.style.fontWeight) css += `font-weight: ${node.style.fontWeight};\n`
      if(node.style.fontFamily) css += `font-family: ${node.style.fontFamily}, sans-serif;\n`
      if(node.style.letterSpacing) css += `letter-spacing: ${node.style.letterSpacing}px;\n`
      if(node.style.lineHeightPx) css += `line-height: ${node.style.lineHeightPx}px;\n`
      if(node.style.color) css += `color: ${rgba(node.style.color)};\n`
      if(node.style.textAlign) css += ` text-align: ${node.style.textAlign.toLowerCase()};\n`
      if(node.style.textDecoration && node.style.textDecoration !== 'NONE')
        css += ` text-decoration: ${node.style.textDecoration.toLowerCase()};\n`
      if(node.text.trim().toLowerCase() === 'forgot password') {
        css += `text-align: center;\n`
        css += ` display: flex; justify-content: center; width: 100%;\n`
        css += ` color: rgba(54, 51, 65, 0.8);\n`
      }
      css+=`}\n\n`      
    }
    
    // ---- rect ----
    for(const node of rects) {
      const inLayout = isInLayout(node.id, frameMap, frames)
      const isInputGroup = inInputGroup(node, frameMap)

      css += `.rect-${safeId(node.id)} {\n`
      if(!inLayout) {
        css += ` position: absolute; \n`      
        css += ` left: ${node.relative.x}px;\n`
        css += ` top: ${node.relative.y}px;\n`
        css += ` width: ${node.size.width}px;\n`
        css += ` height: ${node.size.height}px;\n`      
      } else {
        css += ` position: relative; \n`              
        css += ` width: 100%;\n`
        css += ` height: auto;\n`      
        css += ` display: flex; align-items: center; justify-content: center;\n`
        css += ` padding: 0;\n`
      }
            
      const fill = node.gradient || node.fills?.[0]
      
      if(fill) {        
        if(fill.type === 'SOLID' && fill.color) {
          css += ` background-color: ${rgba(node.fills[0].color)};\n`
        } else if (fill.type && String(fill.type).startsWith('GRADIENT')) {
          const gradCss = gradientToCSS(fill)
          if(gradCss) css += ` background-image: ${gradCss};\n`
        }        
      }

      const radiusCss = cornerRadiusToCss(node)
      if(radiusCss) css += ` border-radius: ${radiusCss};\n` 

      if(node.stroke && !isInputGroup) css += ` border: ${node.stroke.weight}px solid ${rgba(node.stroke.color)};\n`
      if(node.opacity !== undefined && node.opacity !== 1) css += ` opacity: ${node.opacity};\n`
      css+=`}\n\n`
    }
  }

  const cssPath = path.join('output', 'styles.css')
  fs.writeFileSync(cssPath, css)

  return css
}