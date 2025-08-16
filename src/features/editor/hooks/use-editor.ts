// @ts-nocheck
import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";
import { toast } from "sonner";

import { 
  Editor, 
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps, 
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  LINE_HEIGHT,
  LETTER_SPACING,
  TEXT_SHADOW,
  JSON_KEYS,
} from "@/features/editor/types";
import { useHistory } from "@/features/editor/hooks/use-history";
import { 
  createFilter, 
  downloadFile, 
  isTextType,
  transformText
} from "@/features/editor/utils";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useClipboard } from "@/features/editor/hooks//use-clipboard";
import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { useWindowEvents } from "@/features/editor/hooks/use-window-events";
import { useLoadState } from "@/features/editor/hooks/use-load-state";

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const workspace = getWorkspace() as fabric.Rect;
    
    if (workspace) {
      const { width, height, left, top } = workspace;
      return {
        name: "Image",
        format: "png",
        quality: 1,
        width,
        height,
        left,
        top,
      };
    } else {
      // Fallback to default dimensions if no workspace exists
      return {
        name: "Image",
        format: "png",
        quality: 1,
        width: 800,
        height: 600,
        left: 0,
        top: 0,
      };
    }
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async () => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      autoZoom();
    });
  };

  const getWorkspace = () => {
    return canvas
    .getObjects()
    .find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const snapToCenter = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const workspace = getWorkspace();
    if (!workspace) return;

    const workspaceCenter = workspace.getCenterPoint();
    if (!workspaceCenter) return;

    activeObjects.forEach((obj) => {
      // @ts-ignore
      canvas._centerObject(obj, workspaceCenter);
    });

    canvas.renderAll();
    save();
  };

  const snapToPosition = (position: 'center' | 'left' | 'right' | 'top' | 'bottom') => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const workspace = getWorkspace();
    if (!workspace) return;

    const workspaceBounds = workspace.getBoundingRect();
    const workspaceCenter = workspace.getCenterPoint();
    if (!workspaceCenter) return;

    activeObjects.forEach((obj) => {
      const objBounds = obj.getBoundingRect();
      
      switch (position) {
        case 'center':
          // @ts-ignore
          canvas._centerObject(obj, workspaceCenter);
          break;
        case 'left':
          obj.set({ left: workspaceBounds.left + objBounds.width / 2 });
          break;
        case 'right':
          obj.set({ left: workspaceBounds.left + workspaceBounds.width - objBounds.width / 2 });
          break;
        case 'top':
          obj.set({ top: workspaceBounds.top + objBounds.height / 2 });
          break;
        case 'bottom':
          obj.set({ top: workspaceBounds.top + workspaceBounds.height - objBounds.height / 2 });
          break;
      }
    });

    canvas.renderAll();
    save();
  };

  const toggleLockLayer = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // Check the current lock status using a custom property
    const wasLocked = activeObjects[0]?.get('_isLocked') || false;
    
    activeObjects.forEach((obj) => {
      const newLockState = !wasLocked;
      
      if (newLockState) {
        // LOCKING: Make object non-editable but keep it selectable
        obj.set({
          evented: false,           // Can't interact with mouse/keyboard
          hasControls: false,       // No resize handles
          hasBorders: false,        // No selection border
          selectable: true,         // Keep selectable so it can be unlocked
          _isLocked: true          // Mark as locked
        });
      } else {
        // UNLOCKING: Make object fully editable
        obj.set({
          evented: true,            // Can interact normally
          hasControls: true,        // Show resize handles
          hasBorders: true,         // Show selection border
          selectable: true,         // Keep selectable
          _isLocked: false         // Mark as unlocked
        });
      }
    });

    canvas.renderAll();
    save();
    
    // Show the new lock status
    const newLockStatus = !wasLocked;
    toast.success(`Layer${activeObjects.length > 1 ? 's' : ''} ${newLockStatus ? 'locked' : 'unlocked'}`);
    
    // Clear selection after locking to show the locked state
    if (newLockStatus) {
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const isLayerLocked = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return false;
    
    // Check if the first selected object is locked using custom property
    // All objects in a selection should have the same lock state
    return activeObjects[0]?.get('_isLocked') || false;
  };

  const addToCanvas = (object: fabric.Object) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  return {
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio > 1 ? 1 : zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio,
      );
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(value);
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    addImage: (value: string) => {
      fabric.Image.fromURL(
        value,
        (image) => {
          // Get the original image dimensions
          const imgWidth = image.width || 0;
          const imgHeight = image.height || 0;
          
          if (imgWidth > 0 && imgHeight > 0) {
            // Get the current workspace
            const workspace = getWorkspace();
            
            if (workspace) {
              // Store current workspace position before resizing
              const currentLeft = workspace.left || 0;
              const currentTop = workspace.top || 0;
              
              // Resize the workspace to match the image dimensions exactly
              workspace.set({
                width: imgWidth,
                height: imgHeight,
                left: currentLeft,
                top: currentTop
              });
              workspace.setCoords();
              
              // Position image at the workspace position with 1:1 scale (no scaling needed)
              image.set({
                left: currentLeft,
                top: currentTop,
                scaleX: 1,
                scaleY: 1
              });
              
              // Store original position for tracking
              (image as any)._originalPosition = {
                left: currentLeft,
                top: currentTop,
                scaleX: 1,
                scaleY: 1
              };
              
              // Add the image to canvas
              canvas.add(image);
              canvas.setActiveObject(image);
              
              // Auto-zoom to fit the new workspace dimensions
              autoZoom();
              
              // Save the new state
              save();
            } else {
              // Fallback if no workspace exists - use image dimensions
              image.set({
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1
              });
              
              // Store original position for tracking
              (image as any)._originalPosition = {
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1
              };
              
              canvas.add(image);
              canvas.setActiveObject(image);
            }
          } else {
            // Fallback if image dimensions are invalid - use default scaling
            const workspace = getWorkspace();
            if (workspace) {
              const workspaceWidth = workspace.width || 800;
              const workspaceHeight = workspace.height || 600;
              
              image.scaleToWidth(workspaceWidth);
              image.scaleToHeight(workspaceHeight);
              image.set({
                left: 0,
                top: 0
              });
              
              // Store original position for tracking
              (image as any)._originalPosition = {
                left: 0,
                top: 0,
                scaleX: image.scaleX,
                scaleY: image.scaleY
              };
            }
            canvas.add(image);
            canvas.setActiveObject(image);
          }
        },
        {
          crossOrigin: "anonymous",
        },
      );
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontSize exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      // Faulty TS library, fontSize exists.
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      // Faulty TS library, textAlign exists.
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, underline exists.
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, linethrough exists.
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      // Faulty TS library, fontStyle exists.
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeLineHeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, lineHeight exists.
          object.set({ lineHeight: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveLineHeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return LINE_HEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, lineHeight exists.
      const value = selectedObject.get("lineHeight") || LINE_HEIGHT;

      return value;
    },
    changeLetterSpacing: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, charSpacing exists.
          object.set({ charSpacing: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveLetterSpacing: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return LETTER_SPACING;
      }

      // @ts-ignore
      // Faulty TS library, charSpacing exists.
      const value = selectedObject.get("charSpacing") || LETTER_SPACING;

      return value;
    },
    changeTextShadow: (shadow: { color?: string; blur?: number; offsetX?: number; offsetY?: number; enabled?: boolean }) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          if (shadow.enabled === false) {
            object.set({ shadow: null });
          } else {
            const newShadow = new fabric.Shadow({
              color: shadow.color || TEXT_SHADOW.color,
              blur: shadow.blur || TEXT_SHADOW.blur,
              offsetX: shadow.offsetX || TEXT_SHADOW.offsetX,
              offsetY: shadow.offsetY || TEXT_SHADOW.offsetY,
            });
            object.set({ shadow: newShadow });
          }
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveTextShadow: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return TEXT_SHADOW;
      }

      const shadow = selectedObject.get("shadow");
      if (!shadow) {
        return { ...TEXT_SHADOW, enabled: false };
      }

      // Handle both string and Shadow object types
      if (typeof shadow === 'string') {
        return { ...TEXT_SHADOW, enabled: true };
      }

      return {
        color: shadow.color || TEXT_SHADOW.color,
        blur: shadow.blur || TEXT_SHADOW.blur,
        offsetX: shadow.offsetX || TEXT_SHADOW.offsetX,
        offsetY: shadow.offsetY || TEXT_SHADOW.offsetY,
        enabled: true
      };
    },
    nudgeObjects: (direction: 'up' | 'down' | 'left' | 'right', amount: number = 1) => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => {
          switch (direction) {
            case 'up':
              obj.set({ top: obj.top! - amount });
              break;
            case 'down':
              obj.set({ top: obj.top! + amount });
              break;
            case 'left':
              obj.set({ left: obj.left! - amount });
              break;
            case 'right':
              obj.set({ left: obj.left! + amount });
              break;
          }
        });
        canvas.renderAll();
        save(); // Save the nudged position
      }
    },
    getNudgeAmount: () => {
      return 1; // Default nudge amount
    },
    setNudgeAmount: (amount: number) => {
      // This could be stored in state if needed
      // For now, we'll use the default amount
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });

      canvas.renderAll();
      
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontFamily exists.
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );
      addToCanvas(object);
    },
    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, fontWeight exists.
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      // Faulty TS library, fontFamily exists.
      const value = selectedObject.get("fontFamily") || fontFamily;

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    clearLocalStorage: () => {
      try {
        localStorage.removeItem('imageTextComposer');
        // Clear canvas and reset to default state
        if (canvas) {
          canvas.clear();
          // Reset canvas dimensions
          if (container) {
            canvas.setDimensions({
              width: container.offsetWidth,
              height: container.offsetHeight,
            });
          }
          // Re-add workspace
          const workspace = new fabric.Rect({
            width: initialWidth.current,
            height: initialHeight.current,
            name: "clip",
            fill: "white",
            selectable: false,
            hasControls: false,
          });
          canvas.add(workspace);
          canvas.centerObject(workspace);
          canvas.clipPath = workspace;
          canvas.renderAll();
        }
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    },
    snapToCenter,
    snapToPosition,
    toggleLockLayer,
    isLayerLocked,
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();

  const { 
    save, 
    canRedo, 
    canUndo, 
    undo, 
    redo,
    canvasHistory,
    setHistoryIndex,
  } = useHistory({ 
    canvas,
    saveCallback
  });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  const snapToCenter = useCallback(() => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) {
        toast.error("No objects selected");
        return;
      }

      const workspace = canvas.getObjects().find((object) => object.name === "clip");
      if (!workspace) {
        toast.error("Workspace not found");
        return;
      }

      const workspaceCenter = workspace.getCenterPoint();
      if (!workspaceCenter) {
        toast.error("Could not determine workspace center");
        return;
      }

      activeObjects.forEach((obj) => {
        // @ts-ignore
        canvas._centerObject(obj, workspaceCenter);
      });

      canvas.renderAll();
      save();
      toast.success(`Snapped ${activeObjects.length} object${activeObjects.length > 1 ? 's' : ''} to center`);
    }
  }, [canvas, save]);

  const toggleLockLayer = useCallback(() => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) {
        toast.error("No objects selected");
        return;
      }

      activeObjects.forEach((obj) => {
        const isLocked = obj.get('selectable') === false;
        obj.set({
          selectable: !isLocked,
          evented: !isLocked,
          hasControls: !isLocked,
          hasBorders: !isLocked,
        });

        // Add visual lock indicator
        if (!isLocked) {
          // Locking - add lock icon
          obj.set('lockIcon', true);
        } else {
          // Unlocking - remove lock icon
          obj.set('lockIcon', false);
        }
      });

      canvas.renderAll();
      save();
      
      const lockStatus = activeObjects[0]?.get('selectable') === false;
      toast.success(`Layer${activeObjects.length > 1 ? 's' : ''} ${lockStatus ? 'locked' : 'unlocked'}`);
    }
  }, [canvas, save]);





  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
    snapToCenter,
    toggleLockLayer,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        lineHeight: LINE_HEIGHT,
        letterSpacing: LETTER_SPACING,
        textShadow: TEXT_SHADOW,
      });
    }

    return undefined;
  }, 
  [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      // Create initial workspace with container dimensions
      const initialWorkspace = new fabric.Rect({
        width: initialContainer.offsetWidth,
        height: initialContainer.offsetHeight,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(initialContainer.offsetHeight);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      // Try to load saved state from localStorage
      try {
        const savedData = localStorage.getItem('imageTextComposer');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('🔍 Loading saved data:', { 
            hasJson: !!parsedData.json, 
            width: parsedData.width, 
            height: parsedData.height, 
            zoom: parsedData.zoom,
            zoomType: typeof parsedData.zoom 
          });
          if (parsedData.json) {
            // Load the saved canvas state
            initialCanvas.loadFromJSON(parsedData.json, () => {
              // Simulate user interaction immediately to fix rendering issues
              setTimeout(() => {
                try {
                  // Force canvas re-render (simulates clicking buttons)
                  initialCanvas.renderAll();
                  initialCanvas.requestRenderAll();
                  
                  // Simulate a tiny zoom change (like opening dev tools)
                  const currentZoom = initialCanvas.getZoom();
                  initialCanvas.setZoom(currentZoom + 0.001);
                  initialCanvas.setZoom(currentZoom);
                  
                  // Trigger window resize event (often fixes canvas issues)
                  window.dispatchEvent(new Event('resize'));
                  
                  console.log('🔍 Simulated interaction to fix canvas rendering');
                } catch (error) {
                  console.error('Error simulating interaction:', error);
                }
              }, 10);
              
              // Use setTimeout to ensure canvas is fully ready before manipulation
              setTimeout(() => {
                try {
                  // Find and resize the workspace to match saved dimensions
                  if (parsedData.width && parsedData.height) {
                    const workspace = initialCanvas
                      .getObjects()
                      .find((object) => object.name === "clip") as fabric.Rect;
                    
                    if (workspace) {
                      // Resize the workspace to match saved dimensions
                      workspace.set({
                        width: parsedData.width,
                        height: parsedData.height
                      });
                      workspace.setCoords();
                      
                      // Center the workspace
                      initialCanvas.centerObject(workspace);
                      
                      // Update the clip path
                      initialCanvas.clipPath = workspace;
                      
                      // Force a render to ensure everything is updated
                      initialCanvas.requestRenderAll();
                    }
                  }
                  
                  // Restore the saved zoom level AFTER workspace setup
                  if (parsedData.zoom && typeof parsedData.zoom === 'number') {
                    // Use a longer delay to ensure canvas is fully stable
                    setTimeout(() => {
                      try {
                        const center = initialCanvas.getCenter();
                        initialCanvas.zoomToPoint(
                          new fabric.Point(center.left, center.top),
                          parsedData.zoom
                        );
                        console.log(`🔍 Restored zoom level: ${Math.round(parsedData.zoom * 100)}% (saved value: ${parsedData.zoom})`);
                      } catch (error) {
                        console.error('Error restoring zoom level:', error);
                      }
                    }, 200);
                  } else {
                    console.log(`🔍 No valid zoom value found in saved data:`, parsedData.zoom);
                  }
                  
                  // Ensure the image fills the entire workspace dimensions
                  // This ensures the workspace and image have the same dimensions
                  setTimeout(() => {
                    try {
                      const workspace = initialCanvas
                        .getObjects()
                        .find((object) => object.name === "clip") as fabric.Rect;
                      
                      if (workspace && parsedData.width && parsedData.height) {
                        // Keep the saved workspace dimensions
                        const workspaceWidth = parsedData.width;
                        const workspaceHeight = parsedData.height;
                        
                        // Set canvas size to accommodate the workspace with some padding
                        const canvasWidth = Math.max(workspaceWidth + 100, initialContainer.offsetWidth);
                        const canvasHeight = Math.max(workspaceHeight + 100, initialContainer.offsetHeight);
                        
                        initialCanvas.setWidth(canvasWidth);
                        initialCanvas.setHeight(canvasHeight);
                        
                        // Ensure workspace has the correct dimensions
                        workspace.set({
                          width: workspaceWidth,
                          height: workspaceHeight
                        });
                        workspace.setCoords();
                        
                        // Center the workspace in the canvas
                        initialCanvas.centerObject(workspace);
                        
                        // Update the clip path
                        initialCanvas.clipPath = workspace;
                        
                        // Skip automatic image repositioning - preserve saved positions
                        const imageObjects = initialCanvas.getObjects().filter(obj => 
                          obj.type === 'image' && obj.name !== 'clip'
                        );
                        
                        console.log(`🔍 Found ${imageObjects.length} image objects with preserved positions`);
                        
                        imageObjects.forEach((imageObj, index) => {
                          console.log(`🔍 Image ${index + 1} preserved position:`, {
                            type: imageObj.type,
                            left: imageObj.left,
                            top: imageObj.top,
                            width: imageObj.width,
                            height: imageObj.height,
                            scaleX: imageObj.scaleX,
                            scaleY: imageObj.scaleY
                          });
                        });
                        
                        // Force a render
                        initialCanvas.requestRenderAll();
                        
                        // Apply zoom to fit the workspace in the viewport
                        setTimeout(() => {
                          try {
                            const center = initialCanvas.getCenter();
                            const zoomRatio = 0.9; // Slightly higher to ensure workspace fits
                            
                            // Calculate scale to fit the workspace in the viewport
                            const scale = fabric.util.findScaleToFit(workspace, {
                              width: initialContainer.offsetWidth,
                              height: initialContainer.offsetHeight,
                            });
                            
                            const zoom = zoomRatio * scale;
                            
                            // Apply zoom and center
                            initialCanvas.setViewportTransform(fabric.iMatrix.concat());
                            initialCanvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
                            
                            // Center the viewport on the workspace
                            const workspaceCenter = workspace.getCenterPoint();
                            const viewportTransform = initialCanvas.viewportTransform;
                            
                            if (viewportTransform) {
                              viewportTransform[4] = initialContainer.offsetWidth / 2 - workspaceCenter.x * viewportTransform[0];
                              viewportTransform[5] = initialContainer.offsetHeight / 2 - workspaceCenter.y * viewportTransform[3];
                              initialCanvas.setViewportTransform(viewportTransform);
                            }
                            
                            initialCanvas.requestRenderAll();
                            console.log(`🔍 Image workspace set to ${workspaceWidth}x${workspaceHeight}, canvas to ${canvasWidth}x${canvasHeight}`);
                            
                            // Mark that we've loaded from localStorage to prevent autoZoom interference
                            (initialCanvas as any)._loadedFromLocalStorage = true;
                            
                            // Clear the flag after a delay to allow future autoZoom calls
                            setTimeout(() => {
                              (initialCanvas as any)._loadedFromLocalStorage = false;
                              console.log('🔍 Re-enabled autoZoom after localStorage load');
                            }, 2000);
                          } catch (error) {
                            console.error('Error applying zoom after workspace setup:', error);
                          }
                        }, 50);
                      }
                    } catch (error) {
                      console.error('Error setting up image workspace:', error);
                    }
                  }, 100);
                } catch (error) {
                  console.error('Error restoring workspace dimensions:', error);
                }
              }, 50);
            });
            
            // Set the saved state as initial
            const savedState = JSON.stringify(
              initialCanvas.toJSON(JSON_KEYS)
            );
            canvasHistory.current = [savedState];
            setHistoryIndex(0);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }

      // If no saved state, use default
      const currentState = JSON.stringify(
        initialCanvas.toJSON(JSON_KEYS)
      );
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
      
      // Ensure default workspace also occupies full container dimensions
      setTimeout(() => {
        try {
          const width = initialContainer.offsetWidth;
          const height = initialContainer.offsetHeight;
          
          // Resize canvas to match container
          initialCanvas.setWidth(width);
          initialCanvas.setHeight(height);
          
          // Find and resize the default workspace
          const workspace = initialCanvas
            .getObjects()
            .find((object) => object.name === "clip") as fabric.Rect;
          
          if (workspace) {
            // Resize workspace to match container dimensions
            workspace.set({
              width: width,
              height: height
            });
            workspace.setCoords();
            
            // Center the workspace
            initialCanvas.centerObject(workspace);
            
            // Update the clip path
            initialCanvas.clipPath = workspace;
            
            // Force a render
            initialCanvas.requestRenderAll();
            
            // Apply appropriate zoom to fit the workspace
            const center = initialCanvas.getCenter();
            const zoomRatio = 0.9; // Slightly higher to ensure workspace fits
            
            const scale = fabric.util.findScaleToFit(workspace, {
              width: width,
              height: height,
            });
            
            const zoom = zoomRatio * scale;
            
            initialCanvas.setViewportTransform(fabric.iMatrix.concat());
            initialCanvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
            
            // Center the viewport on the workspace
            const workspaceCenter = workspace.getCenterPoint();
            const viewportTransform = initialCanvas.viewportTransform;
            
            if (viewportTransform) {
              viewportTransform[4] = width / 2 - workspaceCenter.x * viewportTransform[0];
              viewportTransform[5] = height / 2 - workspaceCenter.y * viewportTransform[3];
              initialCanvas.setViewportTransform(viewportTransform);
            }
            
            initialCanvas.requestRenderAll();
            console.log(`🔍 Set default workspace to full container dimensions: ${width}x${height}`);
            
            // Mark that we've set up the default workspace to prevent autoZoom interference
            (initialCanvas as any)._loadedFromLocalStorage = true;
            
            // Clear the flag after a delay to allow future autoZoom calls
            setTimeout(() => {
              (initialCanvas as any)._loadedFromLocalStorage = false;
              console.log('🔍 Re-enabled autoZoom after default workspace setup');
            }, 2000);
          }
        } catch (error) {
          console.error('Error setting default workspace dimensions:', error);
        }
      }, 100);
    },
    [
      canvasHistory, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ]
  );

  return { init, editor };
};
