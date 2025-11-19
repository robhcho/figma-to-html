import type { FrameNode } from "./extractFrames.js";
import type { TextNode } from "./extractText.js";
import type { RectNode } from "./extractRect.js";

export type PositionedText = (TextNode & {relative: {x: number; y: number}})
export type PositionedRect = (RectNode & {relative: {x: number; y: number}})

export type PositionedNode = PositionedText | PositionedRect

export const mapToFrames = (frames: FrameNode[], texts: TextNode[], rects: RectNode[]) => {
  const frameMap: Record<string, {texts: PositionedText[]; rects: PositionedRect[]}> = {}

  for(const frame of frames) {
    frameMap[frame.id] = {texts: [], rects: []}
  }

  const contains = (frame:FrameNode, node: {position: {x: number; y: number}}): boolean => {
    const {x,y} = node.position
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

  const assign = <T extends TextNode | RectNode>(
    nodes: T[],
    pushFn: (id: string, node: T & {relative: {x: number; y: number}}) => void
  ) => {
    for(const node of nodes) {
      const prospects = frames.filter(frame => contains(frame, node))
      if(prospects.length === 0) continue
  
      const closestParent = prospects.reduce((a,b) => {
        const aArea = a.size.width * a.size.height
        const bArea = b.size.width * b.size.height
        return bArea < aArea ? a : b
      })
      
      pushFn(closestParent.id, {
        ...node,
        relative: {
          x: node.position.x - closestParent.position.x,
          y: node.position.y - closestParent.position.y,
        }
      })
    }
  }

  assign(texts, (id, node) => frameMap[id]?.texts.push(node))
  assign(rects, (id, node) => frameMap[id]?.rects.push(node))

  return frameMap
 }
