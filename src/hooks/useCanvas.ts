import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from 'fabric';
import { initializeCanvas, updateCanvasFromState, getCanvasState } from '../lib/canvas/fabricSetup';
import { CanvasState, Layer } from '../lib/utils/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_BACKGROUND } from '../lib/utils/constants';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const isUnmountingRef = useRef(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_CANVAS_BACKGROUND,
    layers: [],
    selectedLayerId: null,
  });

  // Initialize canvas
  useEffect(() => {
    console.log('useEffect for canvas initialization running');
    console.log('canvasRef.current:', canvasRef.current);
    console.log('fabricCanvasRef.current:', fabricCanvasRef.current);
    
    if (canvasRef.current && !fabricCanvasRef.current) {
      console.log('Initializing Fabric.js canvas...');
      const canvas = initializeCanvas(
        canvasRef.current,
        canvasState.width,
        canvasState.height
      );
      console.log('Canvas initialized:', canvas);
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

      // Set canvas as ready AFTER everything is set up
      setIsCanvasReady(true);
      console.log('Canvas is now ready for use');
    }

    // Only cleanup when component unmounts, not during re-runs
    return () => {
      // Check if this is a real unmount or just a re-run
      if (isUnmountingRef.current) {
        console.log('Component unmounting. Disposing canvas...');
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
          setIsCanvasReady(false);
        }
      } else {
        console.log('useEffect re-run, keeping canvas alive');
      }
    };
  }, []); // Keep empty dependency array

  // Cleanup effect to detect real unmounts
  useEffect(() => {
    return () => {
      console.log('Component unmounting detected');
      isUnmountingRef.current = true;
    };
  }, []);

  // Update canvas when layers change - ONLY when canvas is ready
  useEffect(() => {
    console.log('useEffect for layers change running');
    console.log('fabricCanvasRef.current:', !!fabricCanvasRef.current);
    console.log('isCanvasReady:', isCanvasReady);
    console.log('layers count:', canvasState.layers.length);
    
    // Only proceed if canvas exists AND is ready
    if (fabricCanvasRef.current && isCanvasReady) {
      console.log('Updating canvas with layers...');
      updateCanvasFromState(fabricCanvasRef.current, canvasState);
      console.log('Canvas updated successfully');
    } else {
      console.log('Canvas not ready yet. Waiting...');
    }
  }, [canvasState.layers, canvasState.backgroundColor, canvasState.selectedLayerId, isCanvasReady]);

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
    console.log('addLayer called with:', layer);
    setCanvasState(prev => {
      const newState = {
        ...prev,
        layers: [...prev.layers, layer],
      };
      console.log('New canvas state:', newState);
      return newState;
    });
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
    isCanvasReady, // Expose this for debugging
  };
};