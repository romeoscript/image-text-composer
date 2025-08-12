import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { Undo2, Redo2, Type, Image as ImageIcon, Square, Trash2, Save, Download } from 'lucide-react';
import { generateId } from '../../lib/utils/helpers';
import { TextLayer, ImageLayer, ShapeLayer } from '../../lib/utils/types';
import { DEFAULT_TEXT_LAYER, DEFAULT_FONT_FAMILY } from '../../lib/utils/constants';
import { useHistory } from '../../hooks/useHistory';
import { ImageUploadModal } from '../Modals/ImageUploadModal';
import { CanvasState } from '../../lib/utils/types';

interface ToolbarProps {
  onExport: () => void;
  onSave: () => void;
  className?: string;
  addLayer: (layer: TextLayer | ImageLayer | ShapeLayer) => void;
  selectLayer: (layerId: string) => void;
  clearCanvas: () => void;
  canvasState: CanvasState;
  updateCanvasSize: (width: number, height: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onExport, 
  onSave, 
  className = '', 
  addLayer,
  selectLayer,
  clearCanvas,
  canvasState,
  updateCanvasSize,
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const history = useHistory(canvasState);

  const handleUndo = () => {
    const previousState = history.undo();
    if (previousState) {
      // Update canvas state
      console.log('Undo to:', previousState);
    }
  };

  const handleRedo = () => {
    const nextState = history.redo();
    if (nextState) {
      // Update canvas state
      console.log('Redo to:', nextState);
    }
  };

  const addTextLayer = () => {
    const textLayer: TextLayer = {
      id: generateId(),
      type: 'text',
      text: 'Sample Text',
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: DEFAULT_TEXT_LAYER.fontSize,
      fontWeight: DEFAULT_TEXT_LAYER.fontWeight,
      fontStyle: DEFAULT_TEXT_LAYER.fontStyle,
      color: DEFAULT_TEXT_LAYER.color,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: DEFAULT_TEXT_LAYER.rotation,
      opacity: DEFAULT_TEXT_LAYER.opacity,
      textAlign: DEFAULT_TEXT_LAYER.textAlign,
      underline: DEFAULT_TEXT_LAYER.underline,
      linethrough: DEFAULT_TEXT_LAYER.linethrough,
    };
    
    // Add the text layer and auto-select it
    addLayer(textLayer);
    
    // Auto-select the newly created text layer
    setTimeout(() => {
      selectLayer(textLayer.id);
    }, 100); // Small delay to ensure the layer is added first
  };

  const addImageLayer = () => {
    setShowImageUpload(true);
  };

  const handleImageAdd = (imageLayer: ImageLayer) => {
    // If this is the first image, auto-resize canvas to match image dimensions
    if (canvasState.layers.length === 0) {
      console.log('First image uploaded - auto-resizing canvas to match dimensions:', {
        imageWidth: imageLayer.width,
        imageHeight: imageLayer.height,
        currentCanvas: `${canvasState.width}x${canvasState.height}`
      });
      
      // Auto-resize canvas to match image dimensions for perfect aspect ratio
      updateCanvasSize(imageLayer.width, imageLayer.height);
    }
    
    addLayer(imageLayer);
    
    // Auto-select the newly created image layer
    setTimeout(() => {
      selectLayer(imageLayer.id);
    }, 100);
  };

  const addShapeLayer = () => {
    const shapeLayer: ShapeLayer = {
      id: generateId(),
      type: 'shape',
      shapeType: 'rectangle',
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      fill: '#ff6b6b',
      stroke: '#000000',
      strokeWidth: 2,
    };
    
    addLayer(shapeLayer);
    
    // Auto-select the newly created shape layer
    setTimeout(() => {
      selectLayer(shapeLayer.id);
    }, 100);
  };

  return (
    <>
      <div className={`bg-blue-500 text-white border-b border-blue-600 px-6 py-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={Undo2}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
              onClick={handleUndo}
              disabled={!history.canUndo}
            >
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Redo2}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
              onClick={handleRedo}
              disabled={!history.canRedo}
            >
              Redo
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={Type}
              onClick={addTextLayer}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
            >
              Add Text
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={ImageIcon}
              onClick={addImageLayer}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
            >
              Add Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Square}
              onClick={addShapeLayer}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
            >
              Add Shape
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={clearCanvas}
              className="text-red-200 border-red-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              onClick={onSave}
              className="text-white border-white hover:bg-white hover:text-blue-500 transition-colors"
            >
              Save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={onExport}
              className="bg-white text-black hover:bg-gray-100 transition-colors"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          onClose={() => setShowImageUpload(false)}
          onImageAdd={handleImageAdd}
          canvasWidth={canvasState.width}
          canvasHeight={canvasState.height}
        />
      )}
    </>
  );
};