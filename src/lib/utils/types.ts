export interface TextLayer {
  id: string;
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  textAlign: string;
  underline: boolean;
  linethrough: boolean;
}

export interface ImageLayer {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface ShapeLayer {
  id: string;
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer;

export interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
  selectedLayerId: string | null;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface FontOption {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg';
  quality: number;
  width: number;
  height: number;
  scale: number;
} 