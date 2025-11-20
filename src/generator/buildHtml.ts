import type { FrameNode } from "../utils/extractFrames.js"
import type { TextNode } from "../utils/extractText.js"
import type { PositionedNode, PositionedRect, PositionedText } from "../utils/mapToFrames.js"
import { safeId } from "../utils/safeId.js"

export const buildHtml = (
  frames: FrameNode[],
  frameMap: Record<string, {texts: PositionedText[], rects: PositionedRect[]}>
) => {
  const topFrames = frames.filter(f => {
    return !frames.some(parent => parent.children.includes(f.id))
  })
  
  const renderFrame = (frame: FrameNode): string => {
    let html = `<div class='frame-${safeId(frame.id)}'>\n`
    const group = frameMap[frame.id] ?? {texts: [], rects: []}

    // rect children
    for(const rect of group.rects) {
      html+= `<div class='rect-${safeId(rect.id)}'></div>\n`
    }

    // text children
    for(const text of group.texts) {
      html += `<div class='text-${safeId(text.id)}'>${text.text}</div>\n`
    }

    // frame children
    for(const childId of frame.children) {
      const child = frames.find(f => f.id === childId)
      if(child) html += renderFrame(child)
    }

    html += `</div>\n`
    return html
  }
  
  const html = []

  html.push(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8' />
        <title>From Figma</title>
        <link rel='stylesheet' href='styles.css'/>
      </head>
      <body>
        <div class='screen'>
  `)
    
    for(const frame of topFrames) {
      html.push(renderFrame(frame))      
    }  
    
  html.push(`
        </div>        
      </body>
    </html>
  `)

  return html.join('\n')
}