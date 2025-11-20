export interface FrameNode {
  id: string
  type: 'FRAME',
  name: string,
  position: {x: number, y: number}
  size: {width: number, height: number}
  children: string[]
  fills: any[]
  clipContent: boolean
  layoutMode: string | null
  padding: {top: number; right: number; bottom: number; left: number}
  itemSpacing: number | null
  primaryAxisAlign: string | null
  counterAxisAlign: string | null
  cornerRadius?: number
  rectangleCornerRadii?: number[]
  strokes?: any[]
  strokeWeight: number
  effects?: any[]
}

export const extractFrames = (node: any, results: FrameNode[] = []) => {
  if(!node) return results

  if(node.type === 'FRAME') {
    const {x, y, width, height} = node.absoluteBoundingBox || {}
    
    results.push({
      id: node.id,
      type: 'FRAME',
      name: node.name,
      position: {x, y},
      size: {width, height},
      children: node.children?.map((child: any) => child.id) || [],
      fills: node.fills || [],
      clipContent: node.clipContent ?? false,
      layoutMode: node.layoutMode ?? null,
      padding: {
        top: node.paddingTop ?? 0,
        right: node.paddingRight ?? 0,
        bottom: node.paddingBottom ?? 0,
        left: node.paddingLeft ?? 0,
      },
      itemSpacing: node.itemSpacing ?? null,
      primaryAxisAlign: node.primaryAxisAlignContent ?? null,
      counterAxisAlign: node.counterAxisAlignContent ?? null,
      cornerRadius: node.cornerRadius,
      rectangleCornerRadii: node.rectangleCornerRadii,
      strokes: node.strokes || [],
      strokeWeight: node.strokeWeight,
      effects: node.effects || [],
    })
  }

  if(node.children && Array.isArray(node.children)) {
    for(const child of node.children) {
      extractFrames(child, results)
    }
  }

  return results
}