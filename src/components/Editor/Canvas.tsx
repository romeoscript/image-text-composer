import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';

interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const {
    canvasRef,
    canvasState,
    updateCanvasSize,
    setBackgroundColor,
  } = useCanvas();

  return (
    <div className={`flex-1 bg-gray-100 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Canvas</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Size:</label>
              <select
                value={`${canvasState.width}x${canvasState.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateCanvasSize(width, height);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="800x600">800x600</option>
                <option value="1080x1080">1080x1080</option>
                <option value="1200x630">1200x630</option>
                <option value="1920x1080">1920x1080</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Background:</label>
              <input
                type="color"
                value={canvasState.backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div
            className="border-2 border-gray-300 rounded-lg overflow-hidden"
            style={{
              width: canvasState.width,
              height: canvasState.height,
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasState.width}
              height={canvasState.height}
              className="block"
            />
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Canvas: {canvasState.width} × {canvasState.height} • 
          Layers: {canvasState.layers.length} • 
          Selected: {canvasState.selectedLayerId ? 'Yes' : 'None'}
        </div>
      </div>
    </div>
  );
}; 