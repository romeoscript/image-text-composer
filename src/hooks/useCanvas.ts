import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from 'fabric';
import { initializeCanvas, updateCanvasFromState, getCanvasState } from '../lib/canvas/fabricSetup';
import { CanvasState, Layer } from '../lib/utils/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_BACKGROUND } from '../lib/utils/constants';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_CANVAS_BACKGROUND,
    layers: [],
    selectedLayerId: null,
  });

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = initializeCanvas(
        canvasRef.current,
        canvasState.width,
        canvasState.height
      );
      fabricCanvasRef.current = canvas;

      // Set up event listeners
      canvas.on('object:modified', () => {
        const newState = getCanvasState(canvas);
        setCanvasState(newState);
      });

      canvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length > 0) {
          const selectedId = e.selected[0].get('id');
          setCanvasState(prev => ({ ...prev, selectedLayerId: selectedId }));
        }
      });

      canvas.on('selection:cleared', () => {
        setCanvasState(prev => ({ ...prev, selectedLayerId: null }));
      });

      canvas.on('object:removed', () => {
        const newState = getCanvasState(canvas);
        setCanvasState(newState);
      });
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Update canvas when state changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      updateCanvasFromState(fabricCanvasRef.current, canvasState);
    }
  }, [canvasState]);

  const updateCanvasSize = useCallback((width: number, height: number) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width, height });
      setCanvasState(prev => ({ ...prev, width, height }));
    }
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = color;
      fabricCanvasRef.current.renderAll();
      setCanvasState(prev => ({ ...prev, backgroundColor: color }));
    }
  }, []);

  const addLayer = useCallback((layer: Layer) => {
    setCanvasState(prev => ({
      ...prev,
      layers: [...prev.layers, layer],
    }));
  }, []);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } as Layer : layer
      ),
    }));
  }, []);

  const removeLayer = useCallback((layerId: string) => {
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId),
      selectedLayerId: prev.selectedLayerId === layerId ? null : prev.selectedLayerId,
    }));
  }, []);

  const selectLayer = useCallback((layerId: string | null) => {
    if (fabricCanvasRef.current) {
      if (layerId) {
        const objects = fabricCanvasRef.current.getObjects();
        const targetObject = objects.find(obj => obj.get('id') === layerId);
        if (targetObject) {
          fabricCanvasRef.current.setActiveObject(targetObject);
        }
      } else {
        fabricCanvasRef.current.discardActiveObject();
      }
      setCanvasState(prev => ({ ...prev, selectedLayerId: layerId }));
    }
  }, []);

  const getSelectedLayer = useCallback(() => {
    if (!canvasState.selectedLayerId) return null;
    return canvasState.layers.find(layer => layer.id === canvasState.selectedLayerId);
  }, [canvasState.selectedLayerId, canvasState.layers]);

  const clearCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      setCanvasState(prev => ({
        ...prev,
        layers: [],
        selectedLayerId: null,
      }));
    }
  }, []);

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    canvasState,
    updateCanvasSize,
    setBackgroundColor,
    addLayer,
    updateLayer,
    removeLayer,
    selectLayer,
    getSelectedLayer,
    clearCanvas,
  };
}; 