import fs from 'fs'
import path from 'path'

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

export const buildCss = (textNodes: TextNode[]) => {
  let css = `
    body {position: relative; font-family: Inter, sans-serif;}\n
  `
  
  for (const node of textNodes) {
    css+= `.text-${node.id} {\n`
    css+= `position: absolute; \n`
    
    if(node.position) {
      css += ` left: ${node.position.x}px;\n`
      css += ` top: ${node.position.y}px;\n`
    }
    if(node.style.fontSize) css += `font-size: ${node.style.fontSize}px;\n`
    if(node.style.fontWeight) css += `font-weight: ${node.style.fontWeight};\n`
    if(node.style.fontFamily) css += `font-family: ${node.style.fontFamily}, sans-serif;\n`
    if(node.style.letterSpacing) css += `letter-spacing: ${node.style.letterSpacing}px;\n`
    if(node.style.lineHeightPx) css += `line-height: ${node.style.lineHeightPx}px;\n`
    if(node.style.color) css += `color: rgba${(node.style.color)};\n`

    css+=`}\n\n`
  }

  const cssPath = path.join('output', 'styles.css')
  fs.writeFileSync(cssPath, css)
}