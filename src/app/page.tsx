'use client';

import React, { useState, useCallback } from 'react';
import { Toolbar, Sidebar, LayerPanel, ExportModal } from '../components';
import { FloatingToolbar } from '../components/Editor/FloatingToolbar';
import { FloatingActionBar } from '../components/Editor/FloatingActionBar';
import { useKonvaCanvas } from '../hooks/useKonvaCanvas';
import dynamic from 'next/dynamic';

// Dynamically import KonvaCanvas to avoid SSR issues
const KonvaCanvas = dynamic(() => import('../components/Editor/KonvaCanvas').then(mod => ({ default: mod.KonvaCanvas })), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">Loading canvas...</div>
});
import { useAutosave } from '../hooks/useAutosave';
import { saveToLocalStorage, loadFromLocalStorage } from '../lib/storage/localStorage';
import { exportCanvasState } from '../lib/canvas/konvaExport';
import { ExportOptions, TextLayer, ImageLayer, ShapeLayer } from '../lib/utils/types';

export default function Home() {
  const {
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
  } = useKonvaCanvas();

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
  // Note: Konva handles interactions differently, so we'll use a simpler approach
  const handleInteractionStart = useCallback(() => setIsInteracting(true), []);
  const handleInteractionEnd = useCallback(() => {
    setTimeout(() => setIsInteracting(false), 100);
  }, []);

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
    exportCanvasState(canvasState, options);
    setShowExportModal(false);
  };

  const selectedLayer = getSelectedLayer();

  // Get selection position for action bar
  const getSelectionPosition = useCallback(() => {
    if (!canvasState.selectedLayerId) return null;
    
    // TODO: Implement Konva selection position calculation
    // For now, return a default position
    return { x: 100, y: 100, width: 200, height: 100 };
  }, [canvasState.selectedLayerId]);

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
              <KonvaCanvas 
                canvasState={canvasState}
                updateCanvasSize={updateCanvasSize}
                setBackgroundColor={setBackgroundColor}
                onLayerSelect={selectLayer}
                onLayerUpdate={updateLayer}
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
