'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasState, Layer } from '../lib/utils/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_BACKGROUND } from '../lib/utils/constants';

export const useKonvaCanvas = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_CANVAS_BACKGROUND,
    layers: [],
    selectedLayerId: null,
  });

  const updateCanvasSize = useCallback((width: number, height: number) => {
    setCanvasState(prev => ({ ...prev, width, height }));
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    setCanvasState(prev => ({ ...prev, backgroundColor: color }));
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
    setCanvasState(prev => ({ ...prev, selectedLayerId: layerId }));
  }, []);

  const getSelectedLayer = useCallback(() => {
    if (!canvasState.selectedLayerId) return null;
    return canvasState.layers.find(layer => layer.id === canvasState.selectedLayerId);
  }, [canvasState.selectedLayerId, canvasState.layers]);

  const duplicateLayer = useCallback((layerId: string) => {
    const layerToDuplicate = canvasState.layers.find(layer => layer.id === layerId);
    if (!layerToDuplicate) return;
    
    const duplicatedLayer = {
      ...layerToDuplicate,
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: (layerToDuplicate.x || 0) + 20,
      y: (layerToDuplicate.y || 0) + 20,
    };
    
    setCanvasState(prev => ({
      ...prev,
      layers: [...prev.layers, duplicatedLayer],
      selectedLayerId: duplicatedLayer.id,
    }));
  }, [canvasState.layers]);

  const clearCanvas = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      layers: [],
      selectedLayerId: null,
    }));
  }, []);

  return {
    canvasState,
    updateCanvasSize,
    setBackgroundColor,
    addLayer,
    updateLayer,
    removeLayer,
    selectLayer,
    getSelectedLayer,
    duplicateLayer,
    clearCanvas,
  };
};
