'use client';

import Konva from 'konva';
import { CanvasState, Layer as LayerType, TextLayer, ImageLayer, ShapeLayer } from '../utils/types';

export const initializeKonvaCanvas = (containerElement: HTMLDivElement, width: number, height: number) => {
  // Create Konva stage
  const stage = new Konva.Stage({
    container: containerElement,
    width,
    height,
  });

  // Create main layer
  const mainLayer = new Konva.Layer();
  stage.add(mainLayer);

  // Set background
  mainLayer.fill('#ffffff');

  return { stage, mainLayer };
};

export const createKonvaTextLayer = (layer: TextLayer): Konva.Text => {
  return new Konva.Text({
    id: layer.id,
    x: layer.x,
    y: layer.y,
    text: layer.text,
    fontSize: layer.fontSize,
    fontFamily: layer.fontFamily,
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle,
    fill: layer.color,
    opacity: layer.opacity,
    rotation: layer.rotation,
    align: layer.textAlign,
    underline: layer.underline,
    linethrough: layer.linethrough,
    draggable: true,
    // CRITICAL: Set high z-index to ensure text is always on top
    zIndex: 1000,
  });
};

export const createKonvaImageLayer = (layer: ImageLayer): Promise<Konva.Image> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const konvaImage = new Konva.Image({
        id: layer.id,
        x: layer.x,
        y: layer.y,
        image,
        width: layer.width,
        height: layer.height,
        opacity: layer.opacity,
        rotation: layer.rotation,
        draggable: true,
        // Images have lower z-index than text
        zIndex: 100,
      });
      resolve(konvaImage);
    };
    image.onerror = reject;
    image.src = layer.src;
  });
};

export const createKonvaShapeLayer = (layer: ShapeLayer): Konva.Shape => {
  let konvaShape: Konva.Shape;

  switch (layer.shapeType) {
    case 'rectangle':
      konvaShape = new Konva.Rect({
        id: layer.id,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        rotation: layer.rotation,
        draggable: true,
        zIndex: 100,
      });
      break;
    case 'circle':
      konvaShape = new Konva.Circle({
        id: layer.id,
        x: layer.x,
        y: layer.y,
        radius: Math.min(layer.width, layer.height) / 2,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        rotation: layer.rotation,
        draggable: true,
        zIndex: 100,
      });
      break;
    case 'triangle':
      konvaShape = new Konva.RegularPolygon({
        id: layer.id,
        x: layer.x + layer.width / 2,
        y: layer.y + layer.height / 2,
        sides: 3,
        radius: Math.min(layer.width, layer.height) / 2,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        rotation: layer.rotation,
        draggable: true,
        zIndex: 100,
      });
      break;
    default:
      throw new Error(`Unknown shape type: ${layer.shapeType}`);
  }

  return konvaShape;
};

export const updateKonvaCanvasFromState = async (
  stage: Konva.Stage,
  mainLayer: Konva.Layer,
  state: CanvasState
): Promise<void> => {
  console.log('Updating Konva canvas from state:', state);

  // Clear existing objects
  mainLayer.destroyChildren();

  // Set background
  mainLayer.fill(state.backgroundColor);

  // Sort layers: non-text first, then text last (to ensure text is always on top)
  const sortedLayers = [...state.layers].sort((a, b) => {
    if (a.type === 'text' && b.type !== 'text') return 1;
    if (a.type !== 'text' && b.type === 'text') return -1;
    return 0;
  });

  console.log('Sorted layers for rendering:', sortedLayers);

  // Process all layers
  for (const layer of sortedLayers) {
    try {
      let konvaObject: Konva.Node;

      switch (layer.type) {
        case 'text':
          konvaObject = createKonvaTextLayer(layer);
          break;
        case 'image':
          konvaObject = await createKonvaImageLayer(layer);
          break;
        case 'shape':
          konvaObject = createKonvaShapeLayer(layer);
          break;
        default:
          continue;
      }

      // Add to layer
      mainLayer.add(konvaObject);

      // Set selection if this is the selected layer
      if (layer.id === state.selectedLayerId) {
        stage.batchDraw();
        // Select the object
        konvaObject.fire('select');
      }

      console.log(`Added ${layer.type} object:`, konvaObject);
    } catch (error) {
      console.error(`Error creating ${layer.type} layer ${layer.id}:`, error);
    }
  }

  // Ensure text objects are always on top by setting their z-index
  mainLayer.children.forEach((child) => {
    if (child instanceof Konva.Text) {
      child.zIndex(1000);
    } else {
      child.zIndex(100);
    }
  });

  // Redraw the layer
  mainLayer.draw();
  stage.batchDraw();
};

export const getKonvaCanvasState = (stage: Konva.Stage, mainLayer: Konva.Layer): CanvasState => {
  const objects = mainLayer.children;
  const layers: LayerType[] = [];

  objects.forEach((obj: Konva.Node) => {
    const id = obj.id();
    if (!id) return;

    const baseLayer = {
      id,
      x: obj.x() || 0,
      y: obj.y() || 0,
      opacity: obj.opacity() || 1,
      rotation: obj.rotation() || 0,
    };

    if (obj instanceof Konva.Text) {
      layers.push({
        ...baseLayer,
        type: 'text',
        text: obj.text() || '',
        fontFamily: obj.fontFamily() || 'Arial, sans-serif',
        fontSize: obj.fontSize() || 24,
        fontWeight: obj.fontWeight() || 'normal',
        fontStyle: obj.fontStyle() || 'normal',
        color: obj.fill() || '#000000',
        textAlign: obj.align() || 'left',
        underline: obj.underline() || false,
        linethrough: obj.linethrough() || false,
        width: obj.width() || 100,
        height: obj.height() || 50,
      } as TextLayer);
    } else if (obj instanceof Konva.Image) {
      layers.push({
        ...baseLayer,
        type: 'image',
        src: (obj.image() as HTMLImageElement).src,
        width: obj.width() || 100,
        height: obj.height() || 100,
      } as ImageLayer);
    } else if (obj instanceof Konva.Shape) {
      let shapeType: 'rectangle' | 'circle' | 'triangle';
      if (obj instanceof Konva.Rect) shapeType = 'rectangle';
      else if (obj instanceof Konva.Circle) shapeType = 'circle';
      else shapeType = 'triangle';

      layers.push({
        ...baseLayer,
        type: 'shape',
        shapeType,
        width: obj.width() || 100,
        height: obj.height() || 100,
        fill: obj.fill() || '#000000',
        stroke: obj.stroke() || '#000000',
        strokeWidth: obj.strokeWidth() || 0,
      } as ShapeLayer);
    }
  });

  return {
    width: stage.width() || 800,
    height: stage.height() || 600,
    backgroundColor: mainLayer.fill() || '#ffffff',
    layers,
    selectedLayerId: null, // Will be handled by selection events
  };
};

// Utility function to ensure text is always on top
export const ensureTextAlwaysOnTop = (mainLayer: Konva.Layer) => {
  mainLayer.children.forEach((child) => {
    if (child instanceof Konva.Text) {
      child.zIndex(1000);
    } else {
      child.zIndex(100);
    }
  });
  mainLayer.draw();
};
