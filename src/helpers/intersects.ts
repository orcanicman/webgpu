import { BoundingBox } from "../types/BoundingBox";

export const intersects = (entity1: BoundingBox, entity2: BoundingBox) => {
  const { x: x1, y: y1, height: height1, width: width1 } = entity1;
  const { x: x2, y: y2, height: height2, width: width2 } = entity2;

  return x1 + width1 > x2 && x2 + width2 > x1 && y1 + height1 > y2 && y2 + height2 > y1;
};
