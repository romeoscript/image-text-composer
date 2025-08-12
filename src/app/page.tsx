'use client';

import React, { useState, useCallback } from 'react';
import { Canvas, Toolbar, Sidebar, LayerPanel, ExportModal } from '../components';
import { FloatingToolbar } from '../components/Editor/FloatingToolbar';
import { FloatingActionBar } from '../components/Editor/FloatingActionBar';
import { useCanvas } from '../hooks/useCanvas';
import { useAutosave } from '../hooks/useAutosave';
import { useHistory } from '../hooks/useHistory';
import { saveToLocalStorage, loadFromLocalStorage } from '../lib/storage/localStorage';
import { exportCanvas } from '../lib/canvas/export';
import { ExportOptions, TextLayer, ImageLayer, ShapeLayer } from '../lib/utils/types';
import { generateId } from '../lib/utils/helpers';

export default function Home() {
  const {
    canvasRef,
    fabricCanvas,
    canvasState,
    updateLayer,
    removeLayer,
    selectLayer,
    getSelectedLayer,
    duplicateLayer,
    updateCanvasSize,
    setBackgroundColor,
    addLayer,
    clearCanvas,
  } = useCanvas();

  // Floating toolbar state
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Interaction state for hiding action bar during manipulation
  const [isInteracting, setIsInteracting] = useState(false);

  // Update toolbar position when selection changes
  const handleSelectionChange = useCallback((layerId: string | null) => {
    if (layerId) {
      const layer = canvasState.layers.find(l => l.id === layerId);
      if (layer && layer.type === 'text') {
        // Calculate position based on layer coordinates
        const x = (layer.x || 0) + (layer.width || 100) / 2;
        const y = layer.y || 0;
        setToolbarPosition({ x, y });
        setToolbarVisible(true);
      } else {
        setToolbarVisible(false);
      }
    } else {
      setToolbarVisible(false);
    }
  }, [canvasState.layers]);

  // Update selection when it changes
  React.useEffect(() => {
    handleSelectionChange(canvasState.selectedLayerId);
  }, [canvasState.selectedLayerId, handleSelectionChange]);

  // Track interaction states to hide action bar during manipulation
  React.useEffect(() => {
    if (!fabricCanvas) return;

    const handleInteractionStart = () => setIsInteracting(true);
    const handleInteractionEnd = () => {
      // Small delay to prevent flickering and ensure interaction is truly complete
      setTimeout(() => setIsInteracting(false), 100);
    };

    // Listen for object manipulation events
    fabricCanvas.on('object:moving', handleInteractionStart);
    fabricCanvas.on('object:scaling', handleInteractionStart);
    fabricCanvas.on('object:rotating', handleInteractionStart);
    fabricCanvas.on('object:modified', handleInteractionEnd);
    fabricCanvas.on('mouse:up', handleInteractionEnd);

    return () => {
      fabricCanvas.off('object:moving', handleInteractionStart);
      fabricCanvas.off('object:scaling', handleInteractionStart);
      fabricCanvas.off('object:rotating', handleInteractionStart);
      fabricCanvas.off('object:modified', handleInteractionEnd);
      fabricCanvas.off('mouse:up', handleInteractionEnd);
    };
  }, [fabricCanvas]);

  // Enable autosave
  useAutosave(canvasState);

  const handleSave = () => {
    saveToLocalStorage(canvasState);
    console.log('Canvas saved to localStorage');
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = (options: ExportOptions) => {
    if (fabricCanvas) {
      exportCanvas(fabricCanvas, options);
    }
    setShowExportModal(false);
  };

  const selectedLayer = getSelectedLayer();

  // Get selection position for action bar
  const getSelectionPosition = useCallback(() => {
    if (!canvasState.selectedLayerId || !fabricCanvas) return null;
    
    const selectedObject = fabricCanvas.getActiveObject();
    if (!selectedObject) return null;
    
    // Get the actual object bounds including any scaling/rotation
    const boundingRect = selectedObject.getBoundingRect();
    const canvasElement = fabricCanvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    const zoom = fabricCanvas.getZoom();
    
    // Convert canvas coordinates to viewport coordinates
    const left = (boundingRect.left * zoom) + canvasRect.left;
    const top = (boundingRect.top * zoom) + canvasRect.top;
    const width = boundingRect.width * zoom;
    const height = boundingRect.height * zoom;
    
    return { x: left, y: top, width, height };
  }, [canvasState.selectedLayerId, fabricCanvas]);

  const selectionPosition = getSelectionPosition();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
      

        <div className="flex-1 flex flex-col">
          <Toolbar 
            onExport={handleExport} 
            onSave={handleSave}
            addLayer={addLayer}
            selectLayer={selectLayer}
            clearCanvas={clearCanvas}
            canvasState={canvasState}
            updateCanvasSize={updateCanvasSize}
          />
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Layer Panel */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <LayerPanel
                layers={canvasState.layers}
                selectedLayerId={canvasState.selectedLayerId}
                onSelectLayer={selectLayer}
                onRemoveLayer={removeLayer}
              />
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 relative">
              <Canvas 
                canvasRef={canvasRef}
                canvasState={canvasState}
                updateCanvasSize={updateCanvasSize}
                setBackgroundColor={setBackgroundColor}
              />
              <FloatingToolbar
                selectedLayer={getSelectedLayer() as TextLayer}
                onUpdateLayer={updateLayer}
                onDeleteLayer={removeLayer}
                onDuplicateLayer={duplicateLayer}
                position={toolbarPosition}
                visible={toolbarVisible && getSelectedLayer()?.type === 'text'}
              />
              <FloatingActionBar
                selectedLayer={getSelectedLayer() || null}
                onDuplicateLayer={duplicateLayer}
                onDeleteLayer={removeLayer}
                position={selectionPosition}
                visible={!!canvasState.selectedLayerId}
                isInteracting={isInteracting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onConfirm={handleExportConfirm}
          canvasState={canvasState}
        />
      )}
    </div>
  );
}
