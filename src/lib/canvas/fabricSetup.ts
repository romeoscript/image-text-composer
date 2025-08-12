import { Canvas, Object, Text, Image, Rect, Circle, Triangle } from 'fabric';
import { CanvasState, Layer, TextLayer, ImageLayer, ShapeLayer } from '../utils/types';

export const initializeCanvas = (canvasElement: HTMLCanvasElement, width: number, height: number): Canvas => {
  const canvas = new Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
  });

  return canvas;
};

export const createTextLayer = (layer: TextLayer): Text => {
  return new Text(layer.text, {
    left: layer.x,
    top: layer.y,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle,
    fill: layer.color,
    opacity: layer.opacity,
    angle: layer.rotation,
    textAlign: layer.textAlign,
    underline: layer.underline,
    linethrough: layer.linethrough,
    selectable: true,
    evented: true,
    id: layer.id,
  });
};

export const createImageLayer = (layer: ImageLayer): Promise<Image> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const fabricImage = new Image(img, {
        left: layer.x,
        top: layer.y,
        scaleX: layer.width / img.width,
        scaleY: layer.height / img.height,
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
        id: layer.id,
      });
      resolve(fabricImage);
    };
    img.onerror = reject;
    img.src = layer.src;
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

  // Add layers
  const promises: Promise<void>[] = [];
  
  for (const layer of state.layers) {
    try {
      let fabricObjectPromise: Promise<Object>;

      switch (layer.type) {
        case 'text':
          const textObject = createTextLayer(layer);
          fabricObjectPromise = Promise.resolve(textObject);
          break;
        case 'image':
          fabricObjectPromise = createImageLayer(layer);
          break;
        case 'shape':
          const shapeObject = createShapeLayer(layer);
          fabricObjectPromise = Promise.resolve(shapeObject);
          break;
        default:
          continue;
      }

      promises.push(
        fabricObjectPromise.then((fabricObject) => {
          canvas.add(fabricObject);
          
          // Select layer if it's the selected one
          if (layer.id === state.selectedLayerId) {
            canvas.setActiveObject(fabricObject);
          }
        })
      );
    } catch (error) {
      console.error(`Error creating layer ${layer.id}:`, error);
    }
  }

  // Wait for all objects to be added
  await Promise.all(promises);
  
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
        fontFamily: obj.fontFamily || 'Arial, sans-serif',
        fontSize: obj.fontSize || 24,
        fontWeight: obj.fontWeight || 'normal',
        fontStyle: obj.fontStyle || 'normal',
        color: obj.fill as string || '#000000',
        textAlign: obj.textAlign || 'left',
        underline: obj.underline || false,
        linethrough: obj.linethrough || false,
        width: obj.width || 100,
        height: obj.height || 50,
      } as TextLayer);
    } else if (obj instanceof Image) {
      layers.push({
        ...baseLayer,
        type: 'image',
        src: (obj as any).getSrc(),
        width: obj.width || 100,
        height: obj.height || 100,
      } as ImageLayer);
    } else if (obj instanceof Rect || obj instanceof Circle || obj instanceof Triangle) {
      let shapeType: 'rectangle' | 'circle' | 'triangle';
      if (obj instanceof Rect) shapeType = 'rectangle';
      else if (obj instanceof Circle) shapeType = 'circle';
      else shapeType = 'triangle';

      layers.push({
        ...baseLayer,
        type: 'shape',
        shapeType,
        width: obj.width || 100,
        height: obj.height || 100,
        fill: obj.fill as string || '#000000',
        stroke: obj.stroke as string || '#000000',
        strokeWidth: obj.strokeWidth || 0,
      } as ShapeLayer);
    }
  });

  const activeObject = canvas.getActiveObject();
  const selectedLayerId = activeObject ? activeObject.get('id') as string : null;

  return {
    width: canvas.width || 800,
    height: canvas.height || 600,
    backgroundColor: canvas.backgroundColor as string || '#ffffff',
    layers,
    selectedLayerId,
  };
};