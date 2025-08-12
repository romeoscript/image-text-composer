import React from 'react';
import { Layer, TextLayer, ImageLayer, ShapeLayer } from '../../lib/utils/types';
import { Slider } from '../UI/Slider';
import { ColorPicker } from '../UI/ColorPicker';
import { FontSelector } from '../UI/FontSelector';

interface SidebarProps {
  selectedLayer: Layer | null;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedLayer, onUpdateLayer }) => {
  if (!selectedLayer) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Select a layer to edit its properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Layer>) => {
    onUpdateLayer(selectedLayer.id, updates);
  };

  const renderTextLayerProperties = (layer: TextLayer) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Content
        </label>
        <textarea
          value={layer.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
          rows={3}
        />
      </div>

      <FontSelector
        label="Font Family"
        value={layer.fontFamily}
        onChange={(font) => handleUpdate({ fontFamily: font })}
      />

      <Slider
        label="Font Size"
        value={layer.fontSize}
        min={8}
        max={72}
        step={1}
        onChange={(size) => handleUpdate({ fontSize: size })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Weight
          </label>
          <select
            value={layer.fontWeight}
            onChange={(e) => handleUpdate({ fontWeight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Style
          </label>
          <select
            value={layer.fontStyle}
            onChange={(e) => handleUpdate({ fontStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Align
        </label>
        <select
          value={layer.textAlign}
          onChange={(e) => handleUpdate({ textAlign: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={layer.underline}
            onChange={(e) => handleUpdate({ underline: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Underline</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={layer.linethrough}
            onChange={(e) => handleUpdate({ linethrough: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Strikethrough</span>
        </label>
      </div>
    </div>
  );

  const renderImageLayerProperties = (layer: ImageLayer) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Source
        </label>
        <input
          type="text"
          value={layer.src}
          onChange={(e) => handleUpdate({ src: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Enter image URL"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Width"
          value={layer.width}
          min={50}
          max={800}
          step={10}
          onChange={(width) => handleUpdate({ width })}
        />

        <Slider
          label="Height"
          value={layer.height}
          min={50}
          max={600}
          step={10}
          onChange={(height) => handleUpdate({ height })}
        />
      </div>
    </div>
  );

  const renderShapeLayerProperties = (layer: ShapeLayer) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shape Type
        </label>
        <select
          value={layer.shapeType}
          onChange={(e) => handleUpdate({ shapeType: e.target.value as 'rectangle' | 'circle' | 'triangle' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Width"
          value={layer.width}
          min={20}
          max={400}
          step={10}
          onChange={(width) => handleUpdate({ width })}
        />

        <Slider
          label="Height"
          value={layer.height}
          min={20}
          max={400}
          step={10}
          onChange={(height) => handleUpdate({ height })}
        />
      </div>

      <ColorPicker
        label="Fill Color"
        value={layer.fill}
        onChange={(fill) => handleUpdate({ fill })}
      />

      <ColorPicker
        label="Stroke Color"
        value={layer.stroke}
        onChange={(stroke) => handleUpdate({ stroke })}
      />

      <Slider
        label="Stroke Width"
        value={layer.strokeWidth}
        min={0}
        max={20}
        step={1}
        onChange={(strokeWidth) => handleUpdate({ strokeWidth })}
      />
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-gray-700">Common Properties</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="X Position"
          value={selectedLayer.x}
          min={0}
          max={800}
          step={10}
          onChange={(x) => handleUpdate({ x })}
        />

        <Slider
          label="Y Position"
          value={selectedLayer.y}
          min={0}
          max={600}
          step={10}
          onChange={(y) => handleUpdate({ y })}
        />
      </div>

      <Slider
        label="Rotation"
        value={selectedLayer.rotation}
        min={-180}
        max={180}
        step={5}
        onChange={(rotation) => handleUpdate({ rotation })}
      />

      <Slider
        label="Opacity"
        value={selectedLayer.opacity}
        min={0}
        max={1}
        step={0.1}
        onChange={(opacity) => handleUpdate({ opacity })}
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Layer Properties
        </h3>
        <p className="text-sm text-gray-600">
          {selectedLayer.type.charAt(0).toUpperCase() + selectedLayer.type.slice(1)} Layer
        </p>
      </div>

      <div className="space-y-6">
        {selectedLayer.type === 'text' && renderTextLayerProperties(selectedLayer as TextLayer)}
        {selectedLayer.type === 'image' && renderImageLayerProperties(selectedLayer as ImageLayer)}
        {selectedLayer.type === 'shape' && renderShapeLayerProperties(selectedLayer as ShapeLayer)}
        
        {renderCommonProperties()}
      </div>
    </div>
  );
}; 