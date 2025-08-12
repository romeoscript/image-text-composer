import React from 'react';
import { Layer, TextLayer, ImageLayer, ShapeLayer } from '../../lib/utils/types';
import { Type, Image as ImageIcon, Shapes, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onRemoveLayer: (layerId: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onRemoveLayer,
}) => {
  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case 'text':
        return <Type className="h-4 w-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      case 'shape':
        return <Shapes className="h-4 w-4 text-purple-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded" />;
    }
  };

  const getLayerName = (layer: Layer) => {
    switch (layer.type) {
      case 'text':
        return (layer as TextLayer).text || 'Text Layer';
      case 'image':
        return 'Image Layer';
      case 'shape':
        return `${(layer as ShapeLayer).shapeType.charAt(0).toUpperCase() + (layer as ShapeLayer).shapeType.slice(1)} Layer`;
      default:
        return 'Unknown Layer';
    }
  };

  const handleLayerClick = (layerId: string) => {
    onSelectLayer(layerId === selectedLayerId ? null : layerId);
  };

  const handleRemoveLayer = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    onRemoveLayer(layerId);
  };

  if (layers.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No layers yet</p>
        <p className="text-sm mt-1">Add some content to get started</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Layers</h3>
        <span className="text-sm text-gray-500">{layers.length}</span>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedLayerId === layer.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleLayerClick(layer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getLayerIcon(layer)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {getLayerName(layer)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {layer.type} • {Math.round(layer.x)}, {Math.round(layer.y)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {layer.opacity > 0 ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-red-400 hover:text-red-600"
                  onClick={(e) => handleRemoveLayer(e, layer.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>• Click to select a layer</p>
          <p>• Drag to reorder layers</p>
          <p>• Use the properties panel to edit</p>
        </div>
      </div>
    </div>
  );
}; 