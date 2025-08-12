import React, { useState, useEffect } from 'react';
import { TextLayer } from '../../lib/utils/types';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Copy, 
  Trash2 
} from 'lucide-react';

interface FloatingToolbarProps {
  selectedLayer: TextLayer | null;
  onUpdateLayer: (layerId: string, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  position: { x: number; y: number } | null;
  visible: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  position,
  visible,
}) => {
  // Local state for opacity slider to prevent jumping
  const [localOpacity, setLocalOpacity] = useState<number>(1);

  // Sync local opacity with selected layer opacity
  useEffect(() => {
    if (selectedLayer) {
      setLocalOpacity(selectedLayer.opacity || 1);
    }
  }, [selectedLayer?.opacity]);

  if (!visible || !selectedLayer || !position || selectedLayer.type !== 'text') {
    return null;
  }

  // Calculate better positioning to ensure toolbar is always visible
  const getToolbarPosition = () => {
    const toolbarWidth = 600; // Approximate toolbar width
    const toolbarHeight = 60;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Start with the text object position
    let x = position.x;
    let y = position.y - toolbarHeight - 10; // Above the text
    
    // Ensure toolbar doesn't go off the left edge
    if (x < toolbarWidth / 2) {
      x = toolbarWidth / 2;
    }
    
    // Ensure toolbar doesn't go off the right edge
    if (x > viewportWidth - toolbarWidth / 2) {
      x = viewportWidth - toolbarWidth / 2;
    }
    
    // Ensure toolbar doesn't go off the top edge
    if (y < 20) {
      y = position.y + 50; // Below the text instead
    }
    
    // Ensure toolbar doesn't go off the bottom edge
    if (y > viewportHeight - toolbarHeight - 20) {
      y = position.y - toolbarHeight - 10; // Above the text
    }
    
    // If the text is in a corner or edge, center the toolbar on screen
    const isNearEdge = 
      position.x < 100 || 
      position.x > viewportWidth - 100 || 
      position.y < 100 || 
      position.y > viewportHeight - 100;
    
    if (isNearEdge) {
      x = viewportWidth / 2;
      y = Math.max(20, Math.min(viewportHeight - toolbarHeight - 20, y));
    }
    
    return { x, y };
  };

  const toolbarPos = getToolbarPosition();

  const handleFontSizeChange = (newSize: number) => {
    onUpdateLayer(selectedLayer.id, { fontSize: newSize });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onUpdateLayer(selectedLayer.id, { fontFamily });
  };

  const handleFontWeightChange = (weight: string) => {
    onUpdateLayer(selectedLayer.id, { fontWeight: weight });
  };

  const handleFontStyleChange = (style: string) => {
    onUpdateLayer(selectedLayer.id, { fontStyle: style });
  };

  const handleTextAlignChange = (align: string) => {
    onUpdateLayer(selectedLayer.id, { textAlign: align });
  };

  const handleColorChange = (color: string) => {
    onUpdateLayer(selectedLayer.id, { color });
  };

  const handleToggleUnderline = () => {
    onUpdateLayer(selectedLayer.id, { underline: !selectedLayer.underline });
  };

  const handleToggleStrikethrough = () => {
    onUpdateLayer(selectedLayer.id, { linethrough: !selectedLayer.linethrough });
  };

  return (
    <div
      className="fixed z-[9998] bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2"
      style={{
         left: '50%',
        top: '60px',
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      {/* Font Family */}
      <select
        value={selectedLayer.fontFamily}
        onChange={(e) => handleFontFamilyChange(e.target.value)}
        className="px-2 text-black py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Font Family"
      >
        <option value="Arial, sans-serif">Arial</option>
        <option value="Helvetica, sans-serif">Helvetica</option>
        <option value="Times New Roman, serif">Times New Roman</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="Verdana, sans-serif">Verdana</option>
        <option value="Courier New, monospace">Courier New</option>
      </select>

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFontSizeChange(Math.max(8, selectedLayer.fontSize - 2))}
          className="w-6 h-6 flex items-center justify-center text-black hover:bg-gray-100 rounded"
          title="Decrease Font Size"
        >
          -
        </button>
        <span className="w-12 text-center text-sm text-black font-medium" title="Current Font Size">
          {selectedLayer.fontSize}
        </span>
        <button
          onClick={() => handleFontSizeChange(selectedLayer.fontSize + 2)}
          className="w-6 h-6 flex items-center justify-center text-black hover:bg-gray-100 rounded"
          title="Increase Font Size"
        >
          +
        </button>
      </div>

      {/* Text Styling */}
      <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
        <button
          onClick={() => handleFontWeightChange(selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold')}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => handleFontStyleChange(selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={handleToggleUnderline}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.underline ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={handleToggleStrikethrough}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.linethrough ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
        <button
          onClick={() => handleTextAlignChange('left')}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => handleTextAlignChange('center')}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => handleTextAlignChange('right')}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            selectedLayer.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Color Picker */}
      <div className="border-l  pl-2 relative">
        <button
          onClick={() => {
            const colorInput = document.getElementById('text-color-picker') as HTMLInputElement;
            if (colorInput) colorInput.click();
          }}
          className="w-8 h-8 flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 rounded border border-none"
          title="Text Color"
        >
          {/* <Type size={12} className="text-gray-700" /> */}
         <span> A</span>
          <div 
            className="w-4/5 h-2 rounded border border-gray-300 mt-0"
            style={{ backgroundColor: selectedLayer.color }}
          />
        </button>
        <input
          id="text-color-picker"
          type="color"
          value={selectedLayer.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="absolute top-full left-0 mt-1 opacity-0 pointer-events-none"
          title="Text Color"
        />
      </div>

      {/* Transparency/Opacity Control */}
      <div className="border-l border-gray-300 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(localOpacity * 100)}
            onChange={(e) => {
              const newOpacity = parseInt(e.target.value) / 100;
              setLocalOpacity(newOpacity);
              onUpdateLayer(selectedLayer.id, { opacity: newOpacity });
            }}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="Text Opacity"
          />
          <span className="text-xs text-gray-600 w-8 text-center">
            {Math.round(localOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
        <button
          onClick={() => onDuplicateLayer(selectedLayer.id)}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={() => onDeleteLayer(selectedLayer.id)}
          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}; 