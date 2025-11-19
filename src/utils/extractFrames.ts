export interface FrameNode {
  id: string
  type: 'FRAME',
  name: string,
  position: {x: number, y: number}
  size: {width: number, height: number}
  children: string[]
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
      children: node.children?.map((child: any) => child.id) || []
    })
  }

  if(node.children && Array.isArray(node.children)) {
    for(const child of node.children) {
      extractFrames(child, results)
    }
  }

  return results
}