export const findFrame = (node: any, name: string): any | null => {
  if (node.name === name) return node

  if (!node.children) return null

  for(const child of node.children) {
    const found = findFrame(child, name)
    if (found) return found
  }
  return null
}