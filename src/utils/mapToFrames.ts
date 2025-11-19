import type { FrameNode } from "./extractFrames.js";
import type { TextNode } from "./extractText.js";

export type PositionedNode = TextNode & {
  relative: {x: number; y: number}
}

export const mapToFrames = (frames: FrameNode[], texts: TextNode[]) => {
  const frameMap: Record<string, PositionedNode[]> = {}

  for(const frame of frames) {
    frameMap[frame.id] = []
  }

  const contains = (frame:FrameNode, text: TextNode): boolean => {
    const {x,y} = text.position
    const fx = frame.position.x
    const fy = frame.position.y
    const fw = frame.size.width
    const fh = frame.size.height

    return (
      x >= fx &&
      x <= fx + fw &&
      y >= fy &&
      y <= fy + fh
    )
  }

  for(const text of texts) {
    const prospects = frames.filter(frame => contains(frame, text))
    if(prospects.length === 0) continue

    const closestParent = prospects.reduce((a,b) => {
      const aArea = a.size.width * a.size.height
      const bArea = b.size.width * b.size.height
      return bArea < aArea ? a : b
    })
    
    frameMap[closestParent.id]?.push({
      ...text,
      relative: {
        x: text.position.x - closestParent.position.x,
        y: text.position.y - closestParent.position.y,
      }
    })
  }

  return frameMap
 }
