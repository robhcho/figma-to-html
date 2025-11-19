import type { FrameNode } from "./extractFrames.js";
import type { TextNode } from "./extractText.js";

export const mapToFrames = (frames: FrameNode[], texts: TextNode[]) => {
  const frameMap: Record<string, TextNode[]> = {}

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
    for (const frame of frames) {
      if(contains(frame, text)) {
        frameMap[frame.id]?.push(text)
      }
    }
  }

  return frameMap
 }
