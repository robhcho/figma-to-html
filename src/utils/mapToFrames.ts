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

  const findParentFrame = (node: {position: {x: number; y: number}} & {id: string}) => {
    // direct parent-frame match from list of frame.children
    for (const f of frames) {
      if(f.children?.includes(node.id)) return f
    }
    
    for(const f of frames) {
      const {x,y} = node.position
      const fx = f.position.x
      const fy = f.position.y
      const fw = f.size.width
      const fh = f.size.height
  
      if (
        x >= fx &&
        x <= fx + fw &&
        y >= fy &&
        y <= fy + fh
      ) return f
    }
    return null
  }

  const pushWithRelative = (
    f: FrameNode,
    node: any
  ) => {
    const rel = {
      x: node.position.x - f.position.x,
      y: node.position.y - f.position.y,
    }
    const withRelative = {...node, relative: rel}

    if ('text' in node) frameMap[f.id]?.texts.push(withRelative)
    else frameMap[f.id]?.rects.push(withRelative)
  }

  for(const t of texts) {
    const p = findParentFrame(t)
    if(p) pushWithRelative(p,t)
  }

  for(const r of rects) {
    const p = findParentFrame(r)
    if(p) pushWithRelative(p,r)
  }

  return frameMap
 }
