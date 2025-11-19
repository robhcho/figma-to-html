export interface RectNode {
  id: string
  type: 'RECTANGLE'
  name: string
  position: {x: number; y: number}
  size: {width: number; height: number}
  fills: any[]
  cornerRadius: number
  stroke: {color: any; weight: number} | null
}

export const extractRect = (node: any, results: RectNode[] = []) => {
  if(!node) return results
  
  if(node.type === 'RECTANGLE') {
    const {x, y, width, height} = node.absoluteBoundingBox || {}
    results.push({
      id: node.id,
      type: 'RECTANGLE',
      name: node.name,
      position: {x,y},
      size: {width, height},
      fills: node.fills || [],
      cornerRadius: node.cornerRadius,
      stroke: node.strokes[0] ? { color: node.strokes[0].color, weight: node.strokeWeight } : null
    })
  }

  if(node.children) {
    node.children.forEach((child: any) => extractRect(child, results))
  }
  return results
}