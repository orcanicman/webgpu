import { BoundingBox } from "../types/BoundingBox";

export const createRectFromBoundingBox = (boundingBox: BoundingBox) => {
  const x1 = boundingBox.x;
  const x2 = boundingBox.x + boundingBox.width;
  const y1 = boundingBox.y;
  const y2 = boundingBox.y + boundingBox.height;

  // prettier-ignore
  return new Float32Array([
        // X, Y,
        x1, y1, // Triangle 1 
        x2, y1, 
        x1, y2, 
        
        x1, y2, // Triangle 2
        x2, y1, 
        x2, y2
    ]);
};
