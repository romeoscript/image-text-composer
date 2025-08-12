import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas } from 'fabric';
import { initializeCanvas, updateCanvasFromState, getCanvasState } from '../lib/canvas/fabricSetup';
import { CanvasState, Layer } from '../lib/utils/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_BACKGROUND } from '../lib/utils/constants';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_CANVAS_BACKGROUND,
    layers: [],
    selectedLayerId: null,
  });

  // Track if we're currently updating to prevent race conditions
  const isUpdatingRef = useRef(false);
  
  // Create a stable reference to the fabric canvas
  const fabricCanvasRefStable = useRef<Canvas | null>(null);

  // Initialize canvas only once
  useEffect(() => {
    console.log('useEffect for canvas initialization running');
    console.log('canvasRef.current:', canvasRef.current);
    console.log('fabricCanvas:', fabricCanvasRef.current);

    // Guard against re-initialization
    if (fabricCanvasRef.current) {
      console.log('Canvas already initialized, skipping...');
      return;
    }

    if (canvasRef.current && !fabricCanvasRef.current) {
      console.log('Initializing Fabric.js canvas...');
      
      const canvas = initializeCanvas(
        canvasRef.current,
        canvasState.width,
        canvasState.height
      );
      
      fabricCanvasRef.current = canvas;
      fabricCanvasRefStable.current = canvas;

      // Set up event listeners
      canvas.on('object:modified', () => {
        if (!isUpdatingRef.current) {
          const newState = getCanvasState(canvas);
          setCanvasState(newState);
        }
      });

      canvas.on('selection:created', (e) => {
        if (!isUpdatingRef.current && e.selected && e.selected.length > 0) {
          const selectedId = e.selected[0].get('id');
          setCanvasState(prev => ({ ...prev, selectedLayerId: selectedId }));
        }
      });

      canvas.on('selection:cleared', () => {
        if (!isUpdatingRef.current) {
          setCanvasState(prev => ({ ...prev, selectedLayerId: null }));
        }
      });

      canvas.on('object:removed', () => {
        if (!isUpdatingRef.current) {
          const newState = getCanvasState(canvas);
          setCanvasState(newState);
        }
      });

      console.log('Canvas initialized:', canvas);
      setIsCanvasReady(true);
      console.log('Canvas is now ready for use');
    }

    // Cleanup function - only run when component unmounts
    return () => {
      console.log('Cleanup effect running - component unmounting');
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        fabricCanvasRefStable.current = null;
        setIsCanvasReady(false);
      }
    };
  }, []); // Empty dependency array - only run once

  // Update canvas when state changes (but only if canvas is ready)
  useEffect(() => {
    console.log('useEffect for layers change running');
    console.log('fabricCanvas:', !!fabricCanvasRef.current);
    console.log('isCanvasReady:', isCanvasReady);
    console.log('layers count:', canvasState.layers.length);

    if (fabricCanvasRef.current && isCanvasReady) {
      console.log('Updating canvas with layers...');
      isUpdatingRef.current = true;
      
      updateCanvasFromState(fabricCanvasRef.current, canvasState)
        .then(() => {
          console.log('Canvas updated successfully');
          isUpdatingRef.current = false;
        })
        .catch((error) => {
          console.error('Error updating canvas:', error);
          isUpdatingRef.current = false;
        });
    } else {
      console.log('Canvas not ready yet. Waiting...');
    }
  }, [canvasState.layers]); // Remove isCanvasReady from dependencies

  const updateCanvasSize = useCallback((width: number, height: number) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      fabricCanvasRef.current.setDimensions({ width, height });
      setCanvasState(prev => ({ ...prev, width, height }));
    }
  }, [isCanvasReady]);

  const setBackgroundColor = useCallback((color: string) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      fabricCanvasRef.current.backgroundColor = color;
      fabricCanvasRef.current.renderAll();
      setCanvasState(prev => ({ ...prev, backgroundColor: color }));
    }
  }, [isCanvasReady]);

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
    if (!isCanvasReady) return;
    
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } as Layer : layer
      ),
    }));
  }, [isCanvasReady]);

  const removeLayer = useCallback((layerId: string) => {
    if (!isCanvasReady) return;
    
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId),
      selectedLayerId: prev.selectedLayerId === layerId ? null : prev.selectedLayerId,
    }));
  }, [isCanvasReady]);

  const selectLayer = useCallback((layerId: string | null) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      isUpdatingRef.current = true;
      
      if (layerId) {
        const objects = fabricCanvasRef.current.getObjects();
        const targetObject = objects.find(obj => obj.get('id') === layerId);
        if (targetObject) {
          fabricCanvasRef.current.setActiveObject(targetObject);
        }
      } else {
        fabricCanvasRef.current.discardActiveObject();
      }
      
      fabricCanvasRef.current.renderAll();
      setCanvasState(prev => ({ ...prev, selectedLayerId: layerId }));
      
      // Small delay to prevent race conditions
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    }
  }, [isCanvasReady]);

  const getSelectedLayer = useCallback(() => {
    if (!canvasState.selectedLayerId) return null;
    return canvasState.layers.find(layer => layer.id === canvasState.selectedLayerId);
  }, [canvasState.selectedLayerId, canvasState.layers]);

  const clearCanvas = useCallback(() => {
    if (fabricCanvasRef.current && isCanvasReady) {
      isUpdatingRef.current = true;
      fabricCanvasRef.current.clear();
      setCanvasState(prev => ({
        ...prev,
        layers: [],
        selectedLayerId: null,
      }));
      isUpdatingRef.current = false;
    }
  }, [isCanvasReady]);

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRefStable.current,
    isCanvasReady,
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