import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Slider } from '../UI/Slider';
import { CanvasState, ExportOptions } from '../../lib/utils/types';
import { EXPORT_FORMATS, CANVAS_SIZES } from '../../lib/utils/constants';

interface ExportModalProps {
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
  canvasState: CanvasState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  onConfirm,
  canvasState,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
    width: canvasState.width,
    height: canvasState.height,
    scale: 1,
  });

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({ ...prev, format: format as 'png' | 'jpg' | 'svg' }));
  };

  const handleSizeChange = (size: string) => {
    const [width, height] = size.split('x').map(Number);
    if (width && height) {
      setExportOptions(prev => ({ ...prev, width, height }));
    }
  };

  const handleConfirm = () => {
    onConfirm(exportOptions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Export Canvas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => handleFormatChange(format.value)}
                  className={`p-3 border rounded-lg text-sm transition-colors ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Size
            </label>
            <select
              value={`${exportOptions.width}x${exportOptions.height}`}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {CANVAS_SIZES.map((size) => (
                <option key={size.name} value={`${size.width}x${size.height}`}>
                  {size.name} {size.width > 0 ? `(${size.width}×${size.height})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quality (for PNG/JPG) */}
          {exportOptions.format !== 'svg' && (
            <Slider
              label="Quality"
              value={exportOptions.quality}
              min={10}
              max={100}
              step={5}
              onChange={(quality) => setExportOptions(prev => ({ ...prev, quality }))}
            />
          )}

          {/* Scale */}
          <Slider
            label="Scale"
            value={exportOptions.scale}
            min={0.5}
            max={4}
            step={0.5}
            onChange={(scale) => setExportOptions(prev => ({ ...prev, scale }))}
          />

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Format: {exportOptions.format.toUpperCase()}</p>
              <p>Size: {exportOptions.width} × {exportOptions.height}</p>
              <p>Scale: {exportOptions.scale}x</p>
              {exportOptions.format !== 'svg' && (
                <p>Quality: {exportOptions.quality}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}; 