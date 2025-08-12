'use client';

import React, { useState, useCallback } from 'react';
import { Canvas, Toolbar, Sidebar, LayerPanel, ExportModal } from '../components';
import { FloatingToolbar } from '../components/Editor/FloatingToolbar';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
      

        <div className="flex-1 flex flex-col">
          <Toolbar 
            onExport={handleExport} 
            onSave={handleSave}
            addLayer={addLayer}
            clearCanvas={clearCanvas}
            canvasState={canvasState}
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
                visible={toolbarVisible}
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
