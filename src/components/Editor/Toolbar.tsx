import React, { useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Type,
  Shapes
} from 'lucide-react';
import { Button } from '../UI/Button';
import { ImageUploadModal } from '../Modals/ImageUploadModal';
import { useCanvas } from '../../hooks/useCanvas';
import { useHistory } from '../../hooks/useHistory';
import { generateId } from '../../lib/utils/helpers';
import { DEFAULT_TEXT_LAYER, DEFAULT_FONT_FAMILY } from '../../lib/utils/constants';
import { TextLayer, ImageLayer, ShapeLayer } from '../../lib/utils/types';

interface ToolbarProps {
  onExport: () => void;
  onSave: () => void;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onExport, 
  onSave, 
  className = '' 
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const {
    addLayer,
    clearCanvas,
    canvasState,
  } = useCanvas();

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
    addLayer(textLayer);
  };

  const addImageLayer = () => {
    setShowImageUpload(true);
  };

  const handleImageAdd = (imageLayer: ImageLayer) => {
    addLayer(imageLayer);
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
  };

  return (
    <>
      <div className={`bg-white border-b border-gray-200 px-6 py-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Undo2}
              onClick={handleUndo}
              disabled={!history.canUndo}
            >
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Redo2}
              onClick={handleRedo}
              disabled={!history.canRedo}
            >
              Redo
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Type}
              onClick={addTextLayer}
            >
              Add Text
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={ImageIcon}
              onClick={addImageLayer}
            >
              Add Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Shapes}
              onClick={addShapeLayer}
            >
              Add Shape
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={clearCanvas}
              className="text-red-600 hover:text-red-700"
            >
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              onClick={onSave}
            >
              Save
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={onExport}
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