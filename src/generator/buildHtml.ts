import type { FrameNode } from "../utils/extractFrames.js"
import type { TextNode } from "../utils/extractText.js"
import type { PositionedNode } from "../utils/mapToFrames.js"
import { safeId } from "../utils/safeId.js"

export const buildHtml = (
  frames: FrameNode[],
  frameMap: Record<string, PositionedNode[]>
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
      
      for(const text of frameMap[frame.id] || []) {
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