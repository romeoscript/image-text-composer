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

// Updated fabricSetup.ts with enhanced text-always-front logic

export const updateCanvasFromState = async (canvas: Canvas, state: CanvasState) => {
  console.log('Updating canvas from state:', state);

  const existingObjects = canvas.getObjects();
  const existingObjectsMap = new Map(existingObjects.map(obj => [obj.get('id') as string, obj]));

  // Sort layers: non-text first, then text last (to ensure text is always on top)
  const sortedLayers = [...state.layers].sort((a, b) => {
    // Text layers should always come last (highest z-index)
    if (a.type === 'text' && b.type !== 'text') return 1;
    if (a.type !== 'text' && b.type === 'text') return -1;
    return 0; // Keep original order for same types
  });

  console.log('Sorted layers for rendering:', sortedLayers);

  // Process non-text layers first
  const promises = [];
  for (const layer of sortedLayers.filter(l => l.type !== 'text')) {
    try {
      const existingObject = existingObjectsMap.get(layer.id);
      
      if (existingObject) {
        updateExistingObject(existingObject, layer, canvas);
      } else {
        // Create new non-text object
        let fabricObject: Object;
        
        if (layer.type === 'image') {
          promises.push(
            createImageLayer(layer).then(imgObject => {
              console.log('Adding image fabric object to canvas:', imgObject);
              
              // Customize object selection styling
              imgObject.set({
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6',
                cornerStrokeColor: '#ffffff',
                cornerSize: 8,
                cornerStyle: 'circle',
                transparentCorners: false,
                borderDashArray: [5, 5],
                borderScaleFactor: 2,
                hasRotatingPoint: true,
                rotatingPointOffset: 30,
              });
              
              canvas.add(imgObject);
              
              if (layer.id === state.selectedLayerId) {
                canvas.setActiveObject(imgObject);
              }
              
              console.log('Canvas objects after adding image:', imgObject);
              canvas.renderAll();
            })
          );
        } else if (layer.type === 'shape') {
          const shapeObject = createShapeLayer(layer);
          
          console.log('Adding shape fabric object to canvas:', shapeObject);
          
          shapeObject.set({
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerStrokeColor: '#ffffff',
            cornerSize: 8,
            cornerStyle: 'circle',
            transparentCorners: false,
            borderDashArray: [5, 5],
            borderScaleFactor: 2,
            hasRotatingPoint: true,
            rotatingPointOffset: 30,
          });
          
          canvas.add(shapeObject);
          
          if (layer.id === state.selectedLayerId) {
            canvas.setActiveObject(shapeObject);
          }
          
          console.log('Canvas objects after adding shape:', shapeObject);
          canvas.renderAll();
        }
      }
    } catch (error) {
      console.error(`Error updating layer ${layer.id}:`, error);
    }
  }

  // Wait for all non-text objects to be added first
  await Promise.all(promises);
  
  // Now add text layers last to ensure they're always on top
  const textLayers = sortedLayers.filter(l => l.type === 'text');
  for (const layer of textLayers) {
    try {
      const existingObject = existingObjectsMap.get(layer.id);
      
      if (existingObject) {
        // Update existing text object properties without recreating
        updateExistingObject(existingObject, layer, canvas);
      } else {
        // Create new text object
        const textObject = createTextLayer(layer);
        
        console.log('Adding text fabric object to canvas:', textObject);
        
        // Customize object selection styling
        textObject.set({
          borderColor: '#3b82f6',
          cornerColor: '#3b82f6',
          cornerStrokeColor: '#ffffff',
          cornerSize: 8,
          cornerStyle: 'circle',
          transparentCorners: false,
          borderDashArray: [5, 5],
          borderScaleFactor: 2,
          hasRotatingPoint: true,
          rotatingPointOffset: 30,
        });
        
        canvas.add(textObject);
        
        if (layer.id === state.selectedLayerId) {
          canvas.setActiveObject(textObject);
        }
        
        console.log('Canvas objects after adding text:', textObject);
        canvas.renderAll();
      }
    } catch (error) {
      console.error(`Error updating text layer ${layer.id}:`, error);
    }
  }
  
  // CRITICAL: Force all text objects to the front after any changes
  ensureTextAlwaysInFront(canvas);
  
  // Remove objects that no longer exist in state
  existingObjects.forEach(obj => {
    const id = obj.get('id') as string;
    if (id && !state.layers.find(l => l.id === id)) {
      canvas.remove(obj);
    }
  });
  
  console.log('Canvas objects after update:', canvas.getObjects());
  canvas.renderAll();
};

/**
 * Ensures all text objects are always at the front (highest z-index)
 * This function should be called whenever objects are added, moved, or modified
 */
export const ensureTextAlwaysInFront = (canvas: Canvas) => {
  const allObjects = canvas.getObjects();
  const textObjects = allObjects.filter(obj => obj instanceof Text);
  const nonTextObjects = allObjects.filter(obj => !(obj instanceof Text));
  
  if (textObjects.length === 0) return; // No text objects to move
  
  console.log('Ensuring text objects are always in front:', textObjects.length);
  
  // Clear canvas and re-add objects in the correct order
  canvas.clear();
  
  // Add non-text objects first
  nonTextObjects.forEach(obj => {
    canvas.add(obj);
  });
  
  // Add text objects last (they will be on top)
  textObjects.forEach(obj => {
    canvas.add(obj);
  });
  
  canvas.renderAll();
};

/**
 * Alternative approach using bringToFront for each text object
 * This is less disruptive but may be less reliable
 */
export const bringAllTextToFront = (canvas: Canvas) => {
  const allObjects = canvas.getObjects();
  const textObjects = allObjects.filter(obj => obj instanceof Text);
  
  // Bring each text object to front
  textObjects.forEach(textObj => {
    canvas.bringToFront(textObj);
  });
  
  canvas.renderAll();
};

/**
 * Hook into canvas events to ensure text stays in front
 */
export const setupTextAlwaysFrontListeners = (canvas: Canvas) => {
  // When any object is added, ensure text stays on top
  canvas.on('object:added', (e) => {
    const obj = e.target;
    if (!(obj instanceof Text)) {
      // If a non-text object was added, move all text to front
      setTimeout(() => bringAllTextToFront(canvas), 0);
    }
  });
  
  // When objects are moved or modified, ensure text stays on top
  canvas.on('object:modified', () => {
    setTimeout(() => bringAllTextToFront(canvas), 0);
  });
  
  // When selection changes, ensure text stays on top
  canvas.on('selection:created', () => {
    setTimeout(() => bringAllTextToFront(canvas), 0);
  });
  
  canvas.on('selection:updated', () => {
    setTimeout(() => bringAllTextToFront(canvas), 0);
  });
};

// Enhanced canvas initialization with text-always-front setup
export const initializeCanvasWithTextPriority = (canvasElement: HTMLCanvasElement, width: number, height: number): Canvas => {
  const canvas = initializeCanvas(canvasElement, width, height);
  
  // Set up listeners to ensure text always stays in front
  setupTextAlwaysFrontListeners(canvas);
  
  return canvas;
};

// CSS to ensure text selection UI is always visible
export const addTextPriorityStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .upper-canvas {
      position: relative;
      z-index: 1000;
    }
    
    /* Ensure text selection controls are always visible */
    .canvas-container .upper-canvas {
      pointer-events: auto;
    }
    
    /* Text objects should have higher visual priority */
    .fabric-text-selected {
      z-index: 9999 !important;
    }
    
    /* Selection handles for text should be more prominent */
    .upper-canvas .upper-canvas__selection-corner[data-text="true"] {
      background: #ef4444 !important;
      border: 2px solid #ffffff !important;
      border-radius: 3px !important;
      width: 10px !important;
      height: 10px !important;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
    }
    
    .upper-canvas .upper-canvas__selection-rotation-handle[data-text="true"] {
      background: #ef4444 !important;
      border: 2px solid #ffffff !important;
      border-radius: 50% !important;
      width: 14px !important;
      height: 14px !important;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
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