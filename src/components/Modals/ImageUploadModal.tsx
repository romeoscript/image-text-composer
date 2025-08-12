import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../UI/Button';
import { FileUpload } from '../UI/FileUpload';
import { generateId, resizeImage } from '../../lib/utils/helpers';
import { ImageLayer } from '../../lib/utils/types';

interface ImageUploadModalProps {
  onClose: () => void;
  onImageAdd: (imageLayer: ImageLayer) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  onClose,
  onImageAdd,
  canvasWidth,
  canvasHeight,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setError('');

    try {
      // Resize image if too large (max 1200x1200 for performance)
      const resizedImage = await resizeImage(file, 1200, 1200);
      
      // Calculate position (center of canvas)
      const centerX = Math.max(0, (canvasWidth - resizedImage.width) / 2);
      const centerY = Math.max(0, (canvasHeight - resizedImage.height) / 2);

      // Create image layer
      const imageLayer: ImageLayer = {
        id: generateId(),
        type: 'image',
        src: resizedImage.dataUrl,
        x: centerX,
        y: centerY,
        width: resizedImage.width,
        height: resizedImage.height,
        rotation: 0,
        opacity: 1,
      };

      onImageAdd(imageLayer);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <FileUpload
            label="Upload Image"
            accept="image/*"
            multiple={false}
            maxSize={10 * 1024 * 1024} // 10MB
            onFileSelect={handleFileSelect}
            disabled={isProcessing}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600">Processing image...</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>• Supported formats: PNG, JPG, GIF, WebP</p>
            <p>• Maximum file size: 10MB</p>
            <p>• Images larger than 1200x1200 will be automatically resized</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};