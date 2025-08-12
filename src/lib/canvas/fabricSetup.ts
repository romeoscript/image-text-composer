import { Canvas, Object, Text, Image, Rect, Circle, Triangle } from 'fabric';
import { CanvasState, Layer, TextLayer, ImageLayer, ShapeLayer } from '../utils/types';

export const initializeCanvas = (canvasElement: HTMLCanvasElement, width: number, height: number): Canvas => {
  const canvas = new Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
  });

  // Customize selection styling for better visibility
  canvas.selectionColor = 'rgba(59, 130, 246, 0.3)'; // Blue with transparency
  canvas.selectionBorderColor = '#3b82f6'; // Solid blue border
  canvas.selectionLineWidth = 2; // Thicker selection border
  canvas.selectionDashArray = [5, 5]; // Dashed selection border for better visibility

  // Add custom CSS for rotation handle
  const style = document.createElement('style');
  style.textContent = `
    .upper-canvas .upper-canvas__selection-rotation-handle {
      background: #3b82f6 !important;
      border: 2px solid #ffffff !important;
      border-radius: 50% !important;
      width: 12px !important;
      height: 12px !important;
      cursor: grab !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    }
    .upper-canvas .upper-canvas__selection-rotation-handle:hover {
      background: #2563eb !important;
      transform: scale(1.1) !important;
      transition: all 0.2s ease !important;
    }
  `;
  document.head.appendChild(style);

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
  console.log('Creating image layer:', layer);
  return new Promise((resolve, reject) => {
    const htmlImg = new window.Image();
    htmlImg.onload = () => {
      console.log('Image loaded successfully:', { imgWidth: htmlImg.width, imgHeight: htmlImg.height, layer });
      const fabricImage = new Image(htmlImg, {
        left: layer.x,
        top: layer.y,
        scaleX: layer.width / htmlImg.width,
        scaleY: layer.height / htmlImg.height,
        opacity: layer.opacity,
        angle: layer.rotation,
        selectable: true,
        evented: true,
        id: layer.id,
      });
      console.log('Fabric image created:', fabricImage);
      resolve(fabricImage);
    };
    htmlImg.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(error);
    };
    console.log('Setting image src:', layer.src);
    htmlImg.src = layer.src;
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
  
  // Set background
  canvas.backgroundColor = state.backgroundColor;

  // Get existing objects to preserve transforms
  const existingObjects = canvas.getObjects();
  const existingObjectsMap = new Map();
  existingObjects.forEach(obj => {
    const id = obj.get('id') as string;
    if (id) {
      existingObjectsMap.set(id, obj);
    }
  });

  // Update or add layers
  const promises: Promise<void>[] = [];
  
  // Sort layers to ensure text is always on top
  const sortedLayers = [...state.layers].sort((a, b) => {
    // Text layers should always be on top
    if (a.type === 'text' && b.type !== 'text') return 1;
    if (a.type !== 'text' && b.type === 'text') return -1;
    // For same types, maintain original order
    return 0;
  });
  
  for (const layer of sortedLayers) {
    try {
      const existingObject = existingObjectsMap.get(layer.id);
      
      if (existingObject) {
        // Update existing object properties without recreating
        updateExistingObject(existingObject, layer, canvas);
        promises.push(Promise.resolve());
      } else {
        // Create new object only if it doesn't exist
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
            console.log('Adding fabric object to canvas:', fabricObject);
            
            // Customize object selection styling
            fabricObject.set({
              borderColor: '#3b82f6',
              cornerColor: '#3b82f6',
              cornerStrokeColor: '#ffffff',
              cornerSize: 8,
              cornerStyle: 'circle',
              transparentCorners: false,
              borderDashArray: [5, 5],
              borderScaleFactor: 2,
              // Custom rotation handle styling
              hasRotatingPoint: true,
              rotatingPointOffset: 30,
            });
            
            canvas.add(fabricObject);
            
            // Select layer if it's the selected one
            if (layer.id === state.selectedLayerId) {
              canvas.setActiveObject(fabricObject);
            }
            
            console.log('Canvas objects after adding:', fabricObject);
            canvas.renderAll();
          })
        );
      }
    } catch (error) {
      console.error(`Error updating layer ${layer.id}:`, error);
    }
  }

  // Remove objects that no longer exist in state
  existingObjects.forEach(obj => {
    const id = obj.get('id') as string;
    if (id && !state.layers.find(l => l.id === id)) {
      canvas.remove(obj);
    }
  });

  // Wait for all objects to be added
  await Promise.all(promises);
  
  console.log('Canvas objects after update:', canvas.getObjects());
  canvas.renderAll();
};

// Helper function to update existing objects without recreating them
const updateExistingObject = (obj: Object, layer: Layer, canvas: Canvas) => {
  // Only update properties that actually changed, preserve transforms
  if (obj instanceof Text && layer.type === 'text') {
    const textLayer = layer as TextLayer;
    if (obj.text !== textLayer.text) obj.set('text', textLayer.text);
    if (obj.fontFamily !== textLayer.fontFamily) obj.set('fontFamily', textLayer.fontFamily);
    if (obj.fontSize !== textLayer.fontSize) obj.set('fontSize', textLayer.fontSize);
    if (obj.fontWeight !== textLayer.fontWeight) obj.set('fontWeight', textLayer.fontWeight);
    if (obj.fontStyle !== textLayer.fontStyle) obj.set('fontStyle', textLayer.fontStyle);
    if (obj.fill !== textLayer.color) obj.set('fill', textLayer.color);
    if (obj.textAlign !== textLayer.textAlign) obj.set('textAlign', textLayer.textAlign);
    if (obj.underline !== textLayer.underline) obj.set('underline', textLayer.underline);
    if (obj.linethrough !== textLayer.linethrough) obj.set('linethrough', textLayer.linethrough);
    if (obj.opacity !== textLayer.opacity) obj.set('opacity', textLayer.opacity);
  }
  
  // Don't update position, size, or rotation as these are handled by transforms
  // obj.set('left', layer.x);
  // obj.set('top', layer.y);
  // obj.set('width', layer.width);
  // obj.set('height', layer.height);
  // obj.set('angle', layer.rotation);
  
  obj.setCoords();
  canvas.renderAll(); // Re-render to show opacity changes
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