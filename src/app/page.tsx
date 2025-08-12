'use client';

import React, { useState } from 'react';
import { Canvas, Toolbar, Sidebar, LayerPanel, ExportModal } from '../components';
import { useCanvas } from '../hooks/useCanvas';
import { useAutosave } from '../hooks/useAutosave';
import { saveToLocalStorage, loadFromLocalStorage } from '../lib/storage/localStorage';
import { exportCanvas } from '../lib/canvas/export';
import { ExportOptions } from '../lib/utils/types';

export default function Home() {
  const [showExportModal, setShowExportModal] = useState(false);
  const {
    canvasRef,
    fabricCanvas,
    canvasState,
    updateLayer,
    removeLayer,
    selectLayer,
    getSelectedLayer,
    updateCanvasSize,
    setBackgroundColor,
    addLayer,
    clearCanvas,
  } = useCanvas();

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
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Image Text Composer
            </h1>
            <p className="text-gray-600 mt-1">
              Create beautiful compositions with text, images, and shapes
            </p>
          </div>
        </header>

        {/* Toolbar */}
        <Toolbar 
          onExport={handleExport} 
          onSave={handleSave}
          addLayer={addLayer}
          clearCanvas={clearCanvas}
          canvasState={canvasState}
        />

        {/* Main Content */}
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
          <Canvas 
            canvasRef={canvasRef}
            canvasState={canvasState}
            updateCanvasSize={updateCanvasSize}
            setBackgroundColor={setBackgroundColor}
          />

          {/* Right Sidebar - Properties */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <Sidebar
              selectedLayer={selectedLayer || null}
              onUpdateLayer={updateLayer}
            />
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
