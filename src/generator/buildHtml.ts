import fs from 'fs'
import path from 'path'

interface TextNode {
  id: string
  text: string

}

export const buildHtml = (textNodes: TextNode[]) => {
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
        <div>
  `)
    for(const node of textNodes) {
      html.push(`
        <div class='text-${node.id}'>
        ${node.text}
        </div>
      `)
    }
  html.push(`
        </div>
      </body>
    </html>
  `)

  return html.join('\n')
}