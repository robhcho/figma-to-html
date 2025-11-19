export interface TextStyle {
  fontSize: number
  fontWeight: number
  fontFamily: string
  color: {r: number; g:number; b: number; a: number}
  letterSpacing: number
  lineHeightPx: number
}

export interface TextNode {
  id: string
  type: string
  text: string
  position: {x: number; y:number}
  size: {width: number; height: number}
  style: TextStyle
}

export const extractText = (node: any, results: TextNode[] = []) => {
  if(!node) return results

  if(node.type === 'TEXT' && node.characters) {
    const {x, y, width, height} = node.absoluteBoundingBox || {}
    const style = node.style || {}

    results.push({
      id: node.id,
      type: 'TEXT',
      text: node.characters,
      position: {x, y},
      size: { width, height},
      style: {
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        color: node.fills?.[0]?.color || null,
        letterSpacing: style.letterSpacing,
        lineHeightPx: style.lineHeightPx
      }
    })
  }

  if(node.children && Array.isArray(node.children)) {
    for(const child of node.children) {
      extractText(child, results)
    }
  }

  return results
}