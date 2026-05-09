
export interface Point {
  x: number;
  y: number;
}

export interface Landmark extends Point {
  id: string;
  name: string;
  description: string;
  category: 'Skeletal' | 'Dental' | 'Soft Tissue';
}

export interface Calibration {
  p1: Point | null;
  p2: Point | null;
  distanceMm: number;
  pixelsPerMm: number | null;
}

export type ToolType = 'view' | 'landmark' | 'calibrate' | 'distance' | 'angle' | 'area';

export interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'area';
  points: Point[];
  value: number;
  unit: string;
}

export interface AnalysisResult {
  name: string;
  value: number;
  unit: string;
  norm: string;
  interpretation: string;
  category: string;
}

export interface ImageSettings {
  brightness: number;
  contrast: number;
  zoom: number;
  pan: Point;
}
