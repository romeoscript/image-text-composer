import React from 'react';
import { Copy, Trash2, RotateCw } from 'lucide-react';
import { Layer } from '../../lib/utils/types';

interface FloatingActionBarProps {
  selectedLayer: Layer | null;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  position: { x: number; y: number; width: number; height: number } | null;
  visible: boolean;
  isInteracting: boolean;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedLayer,
  onDuplicateLayer,
  onDeleteLayer,
  position,
  visible,
  isInteracting,
}) => {
  if (!visible || !selectedLayer || !position || isInteracting) {
    return null;
  }

  const { x, y, width, height } = position;

  return (
    <div 
      className="fixed z-[9999]"
      style={{
        left: x + width + 10,
        top: y - 10,
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => onDuplicateLayer(selectedLayer.id)}
          className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={16} className="text-gray-600" />
        </button>
        <button
          onClick={() => onDeleteLayer(selectedLayer.id)}
          className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          title="Delete (Del)"
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
        <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <RotateCw size={14} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}; 