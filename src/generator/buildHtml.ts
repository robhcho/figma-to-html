import type { FrameNode } from "../utils/extractFrames.js"
import type { TextNode } from "../utils/extractText.js"
import type { PositionedNode, PositionedRect, PositionedText } from "../utils/mapToFrames.js"
import { safeId } from "../utils/safeId.js"

export const buildHtml = (
  frames: FrameNode[],
  frameMap: Record<string, {texts: PositionedText[], rects: PositionedRect[]}>
) => {
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
    for(const frame of frames) {
      html.push(`<div class='frame-${safeId(frame.id)}'>`)      
      
      const group = frameMap[frame.id] ?? {texts: [], rects: []}
      
      for(const rect of group.rects) {
        html.push(`<div class='rect-${safeId(rect.id)}'></div>`)
      }
      for(const text of group.texts) {
        html.push(`
          <div class='text-${safeId(text.id)}'>
            ${text.text}
          </div>
        `)
      }
      html.push(`</div>\n`)
    }
    
  html.push(`
        </div>        
      </body>
    </html>
  `)

  return html.join('\n')
}