
import { Point } from '../types';

export const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  const d23 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
  const d13 = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));

  const cosTheta = (Math.pow(d12, 2) + Math.pow(d23, 2) - Math.pow(d13, 2)) / (2 * d12 * d23);
  return (Math.acos(cosTheta) * 180) / Math.PI;
};

export const calculateDistance = (p1: Point, p2: Point, pixelsPerMm: number): number => {
  const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  return dist / pixelsPerMm;
};

export const pointToLineDistance = (p0: Point, lineP1: Point, lineP2: Point, pixelsPerMm: number): number => {
  const num = Math.abs((lineP2.x - lineP1.x) * (lineP1.y - p0.y) - (lineP1.x - p0.x) * (lineP2.y - lineP1.y));
  const den = Math.sqrt(Math.pow(lineP2.x - lineP1.x, 2) + Math.pow(lineP2.y - lineP1.y, 2));
  return (num / den) / pixelsPerMm;
};

// Calculate angle between two vectors represented by points (intersecting or not)
export const getAngleBetweenVectors = (a1: Point, a2: Point, b1: Point, b2: Point): number => {
  const v1 = { x: a2.x - a1.x, y: a2.y - a1.y };
  const v2 = { x: b2.x - b1.x, y: b2.y - b1.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const angle = Math.acos(dot / (mag1 * mag2));
  return (angle * 180) / Math.PI;
};
