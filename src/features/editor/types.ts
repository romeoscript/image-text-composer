import { fabric } from "fabric";
import { ITextboxOptions } from "fabric/fabric-impl";
import * as material from "material-colors";

/**
 * JSON_KEYS - Properties that will be saved to localStorage and persisted across sessions
 * 
 * This comprehensive list ensures that all important styling, positioning, and text properties
 * are saved when the canvas state is serialized to JSON.
 * 
 * Basic Object Properties: Position, size, scale, rotation
 * Text Properties: Font settings, spacing, alignment, decorations  
 * Visual Properties: Colors, strokes, opacity, shadows
 * Control Properties: Selection, controls, borders, interaction
 * Custom Properties: Lock states and other custom data
 */
export const JSON_KEYS = [
  // Basic object properties
  "name",
  "left",
  "top",
  "width", 
  "height",
  "scaleX",
  "scaleY",
  "angle",
  "originX",
  "originY",
  "flipX",
  "flipY",
  "skewX", 
  "skewY",
  
  // Text properties
  "fontSize",
  "fontFamily", 
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "charSpacing",
  "textAlign",
  "underline",
  "linethrough",
  
  // Visual properties
  "fill",
  "stroke",
  "strokeWidth",
  "strokeDashArray",
  "opacity",
  "shadow",
  "visible",
  
  // Control properties
  "selectable",
  "hasControls",
  "hasBorders",
  "evented",
  "moveCursor",
  "hoverCursor",
  
  // Image-specific properties
  "src",
  "crossOrigin",
  "filters",
  
  // Other properties
  "gradientAngle",
  "linkData",
  "editable",
  "extensionType",
  "extension",
  
  // Custom properties
  "_isLocked",
  "_originalPosition"
];

export const filters = [
  "none",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "greyscale",
  "brownie",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "sharpen",
  "emboss",
  "removecolor",
  "blacknwhite",
  "vibrance",
  "blendcolor",
  "huerotate",
  "resize",
  "saturation",
  "gamma",
];

// Fonts are now loaded from Google Fonts API
// See src/lib/google-fonts.ts for implementation

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const colors = [
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.blueGrey["500"],
  "transparent",
];

export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates"
  | "text-enhancement";

export const FILL_COLOR = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = "Arial";
export const FONT_SIZE = 32;
export const FONT_WEIGHT = 400;
export const LINE_HEIGHT = 1.2;
export const LETTER_SPACING = 0;
export const TEXT_SHADOW = {
  color: "rgba(0,0,0,0.3)",
  blur: 4,
  offsetX: 2,
  offsetY: 2,
  enabled: false
};

export const FONT_WEIGHTS = [
  { value: 100, label: "Thin" },
  { value: 200, label: "Extra Light" },
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semi Bold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra Bold" },
  { value: 900, label: "Black" },
];

export const CIRCLE_OPTIONS = {
  radius: 225,
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
};

export const RECTANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export const DIAMOND_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 600,
  height: 600,
  angle: 0,
};

export const TRIANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export const TEXT_OPTIONS = {
  type: "textbox",
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  fontSize: FONT_SIZE,
  fontFamily: FONT_FAMILY,
};

export interface EditorHookProps {
  defaultState?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  clearSelectionCallback?: () => void;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
    zoom: number;
  }) => void;
};

export type BuildEditorProps = {
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  canvas: fabric.Canvas;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  selectedObjects: fabric.Object[];
  strokeDashArray: number[];
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  textShadow: { color: string; blur: number; offsetX: number; offsetY: number; enabled: boolean };
  setStrokeDashArray: (value: number[]) => void;
  setFillColor: (value: string) => void;
  setStrokeColor: (value: string) => void;
  setStrokeWidth: (value: number) => void;
  setFontFamily: (value: string) => void;
  setLineHeight: (value: number) => void;
  setLetterSpacing: (value: number) => void;
  setTextShadow: (shadow: { color?: string; blur?: number; offsetX?: number; offsetY?: number; enabled?: boolean }) => void;
};

export interface Editor {
  savePng: () => void;
  saveJpg: () => void;
  saveSvg: () => void;
  saveJson: () => void;
  loadJson: (json: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getWorkspace: () => fabric.Object | undefined;
  changeBackground: (value: string) => void;
  changeSize: (value: { width: number; height: number }) => void;
  enableDrawingMode: () => void;
  disableDrawingMode: () => void;
  onCopy: () => void;
  onPaste: () => void;
  changeImageFilter: (value: string) => void;
  addImage: (value: string) => void;
  delete: () => void;
  changeFontSize: (value: number) => void;
  getActiveFontSize: () => number;
  changeTextAlign: (value: string) => void;
  getActiveTextAlign: () => string;
  changeFontUnderline: (value: boolean) => void;
  getActiveFontUnderline: () => boolean;
  changeFontLinethrough: (value: boolean) => void;
  getActiveFontLinethrough: () => boolean;
  changeFontStyle: (value: string) => void;
  getActiveFontStyle: () => string;
  changeFontWeight: (value: number) => void;
  getActiveFontWeight: () => number;
  getActiveFontFamily: () => string;
  changeFontFamily: (value: string) => void;
  changeLineHeight: (value: number) => void;
  getActiveLineHeight: () => number;
  changeLetterSpacing: (value: number) => void;
  getActiveLetterSpacing: () => number;
  changeTextShadow: (shadow: { color?: string; blur?: number; offsetX?: number; offsetY?: number; enabled?: boolean }) => void;
  getActiveTextShadow: () => { color: string; blur: number; offsetX: number; offsetY: number; enabled: boolean };
  nudgeObjects: (direction: 'up' | 'down' | 'left' | 'right', amount?: number) => void;
  getNudgeAmount: () => number;
  setNudgeAmount: (amount: number) => void;
  snapToCenter: () => void;
  snapToPosition: (position: 'center' | 'left' | 'right' | 'top' | 'bottom') => void;
  toggleLockLayer: () => void;
  isLayerLocked: () => boolean;
  addText: (value: string, options?: ITextboxOptions) => void;
  getActiveOpacity: () => number;
  changeOpacity: (value: number) => void;
  bringForward: () => void;
  sendBackwards: () => void;
  changeStrokeWidth: (value: number) => void;
  changeFillColor: (value: string) => void;
  changeStrokeColor: (value: string) => void;
  changeStrokeDashArray: (value: number[]) => void;
  addCircle: () => void;
  addSoftRectangle: () => void;
  addRectangle: () => void;
  addTriangle: () => void;
  addInverseTriangle: () => void;
  addDiamond: () => void;
  canvas: fabric.Canvas;
  getActiveFillColor: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray: () => number[];
  clearLocalStorage: () => void;
  selectedObjects: fabric.Object[];
};
