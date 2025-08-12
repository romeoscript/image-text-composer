import { Canvas, Text, Image, Object, Rect, Circle, Triangle } from 'fabric';
import { CanvasState, Layer, TextLayer, ImageLayer, ShapeLayer } from '../utils/types';

export const initializeCanvas = (
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number
): Canvas => {
  const canvas = new Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true,
  });

  // Enable touch support
  canvas.setDimensions({ width, height });
  
  return canvas;
};

export const createTextLayer = (layer: TextLayer): Text => {
  const text = new Text(layer.text, {
    left: layer.x,
    top: layer.y,
    fontSize: layer.fontSize,
    fontFamily: layer.fontFamily,
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle,
    fill: layer.color,
    textAlign: layer.textAlign as 'left' | 'center' | 'right' | 'justify',
    underline: layer.underline,
    linethrough: layer.linethrough,
    opacity: layer.opacity,
    angle: layer.rotation,
    selectable: true,
    evented: true,
  });

  text.set('id', layer.id);
  return text;
};

export const createImageLayer = (layer: ImageLayer): Promise<Image> => {
  return new Promise((resolve) => {
    // @ts-expect-error - Fabric.js API expects callback as second parameter
    Image.fromURL(layer.src, (img: Image) => {
      img.set({
        left: layer.x,
        top: layer.y,
        scaleX: layer.width / (img.width || 1),
        scaleY: layer.height / (img.height || 1),
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
        id: layer.id,
      });
      resolve(img);
    });
  });
};

export const createShapeLayer = (layer: ShapeLayer): Object => {
  let shape: Object;

  switch (layer.shapeType) {
    case 'rectangle':
      shape = new Rect({
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
      });
      break;
    case 'circle':
      shape = new Circle({
        left: layer.x,
        top: layer.y,
        radius: Math.min(layer.width, layer.height) / 2,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
      });
      break;
    case 'triangle':
      shape = new Triangle({
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
      });
      break;
    default:
      throw new Error(`Unknown shape type: ${layer.shapeType}`);
  }

  shape.set('id', layer.id);
  return shape;
};

export const updateCanvasFromState = async (
  canvas: Canvas,
  state: CanvasState
): Promise<void> => {
  console.log('updateCanvasFromState called with:', state);
  
  // Clear existing objects
  canvas.clear();
  
  // Set background
  canvas.backgroundColor = state.backgroundColor;
  canvas.renderAll();

  // Add layers
  for (const layer of state.layers) {
    try {
      console.log('Processing layer:', layer);
      let fabricObject: Object;

      switch (layer.type) {
        case 'text':
          fabricObject = createTextLayer(layer);
          canvas.add(fabricObject);
          console.log('Added text layer:', fabricObject);
          break;
        case 'image':
          fabricObject = await createImageLayer(layer);
          canvas.add(fabricObject);
          console.log('Added image layer:', fabricObject);
          break;
        case 'shape':
          fabricObject = createShapeLayer(layer);
          canvas.add(fabricObject);
          console.log('Added shape layer:', fabricObject);
          break;
      }

      // Select layer if it's the selected one
      if (layer.id === state.selectedLayerId) {
        canvas.setActiveObject(fabricObject);
      }
    } catch (error) {
      console.error(`Error creating layer ${layer.id}:`, error);
    }
  }

  console.log('Canvas objects after update:', canvas.getObjects());
  canvas.renderAll();
};

export const getCanvasState = (canvas: Canvas): CanvasState => {
  const objects = canvas.getObjects();
  const layers: Layer[] = [];

  objects.forEach((obj: Object) => {
    const id = obj.get('id') as string;
    if (!id) return;

    const baseLayer = {
      id,
      x: obj.left || 0,
      y: obj.top || 0,
      opacity: obj.opacity || 1,
      rotation: obj.angle || 0,
    };

    if (obj instanceof Text) {
      layers.push({
        ...baseLayer,
        type: 'text',
        text: obj.text || '',
        fontFamily: obj.fontFamily || 'Arial',
        fontSize: obj.fontSize || 24,
        fontWeight: String(obj.fontWeight || 'normal'),
        fontStyle: obj.fontStyle || 'normal',
        color: obj.fill as string || '#000000',
        width: obj.width || 0,
        height: obj.height || 0,
        textAlign: obj.textAlign || 'left',
        underline: obj.underline || false,
        linethrough: obj.linethrough || false,
      });
    } else if (obj instanceof Image) {
      layers.push({
        ...baseLayer,
        type: 'image',
        src: obj.getSrc() || '',
        width: (obj.width || 0) * (obj.scaleX || 1),
        height: (obj.height || 0) * (obj.scaleY || 1),
      });
    } else if (obj instanceof Rect || obj instanceof Circle || obj instanceof Triangle) {
      let shapeType: 'rectangle' | 'circle' | 'triangle';
      if (obj instanceof Rect) shapeType = 'rectangle';
      else if (obj instanceof Circle) shapeType = 'circle';
      else shapeType = 'triangle';

      layers.push({
        ...baseLayer,
        type: 'shape',
        shapeType,
        width: obj.width || 0,
        height: obj.height || 0,
        fill: obj.fill as string || '#000000',
        stroke: obj.stroke as string || '#000000',
        strokeWidth: obj.strokeWidth || 0,
      });
    }
  });

  return {
    width: canvas.width || 800,
    height: canvas.height || 600,
    backgroundColor: String(canvas.backgroundColor || '#ffffff'),
    layers,
    selectedLayerId: canvas.getActiveObject()?.get('id') || null,
  };
}; 