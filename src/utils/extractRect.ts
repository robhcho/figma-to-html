export interface RectNode {
  id: string
  type: 'RECTANGLE'
  name: string
  position: {x: number; y: number}
  size: {width: number; height: number}
  fills: any[]
  cornerRadius?: number
  rectangleCornerRadii?: number[]
  stroke: {color: any; weight: number} | null
  opacity?: number
  blendMode: string | null
  gradient: any | null
  effects?: any[]
}

export const extractRect = (node: any, results: RectNode[] = []) => {
  if(!node) return results
  
  if(
    node.type === 'RECTANGLE' ||
    node.type === 'VECTOR' ||
    node.type === 'LINE' 
  ) {
    const {x, y, width, height} = node.absoluteBoundingBox || {}
    const fills = Array.isArray(node.fills) ? node.fills : []
    const firstFill = fills[0] || null

    const hasGradient = firstFill && typeof firstFill.type === 'string' &&
      firstFill.type.startsWith('GRADIENT')
    
    results.push({
      id: node.id,
      type: 'RECTANGLE',
      name: node.name,
      position: {x,y},
      size: {width, height},
      fills: node.fills || [],
      cornerRadius: node.cornerRadius,
      rectangleCornerRadii: node.rectangleCornerRadii,
      stroke: node.strokes[0] ? { color: node.strokes[0].color, weight: node.strokeWeight } : null,
      opacity: node.opacity ?? 1,
      blendMode: node.blendMode ?? null,
      gradient: hasGradient ? firstFill : null,
      effects: node.effects || [],
    })
  }

  if(node.children) {
    node.children.forEach((child: any) => extractRect(child, results))
  }
  return results
}