import { Stage, Layer } from 'konva';
import { CanvasState, ExportOptions } from '../utils/types';

export const exportKonvaCanvas = async (
  stage: Stage,
  options: ExportOptions
): Promise<void> => {
  try {
    console.log('Exporting Konva canvas with options:', options);
    
    // Get the main layer
    const mainLayer = stage.findOne('Layer') as Layer;
    if (!mainLayer) {
      throw new Error('Main layer not found');
    }

    // Set the stage size for export
    const originalWidth = stage.width();
    const originalHeight = stage.height();
    
    // Apply export dimensions if specified
    if (options.width && options.height) {
      stage.width(options.width);
      stage.height(options.height);
      stage.scale({ x: options.width / originalWidth, y: options.height / originalHeight });
    }

    // Convert to data URL
    const dataURL = stage.toDataURL({
      pixelRatio: options.quality ? options.quality / 100 : 1,
      mimeType: options.format === 'jpg' ? 'image/jpeg' : 'image/png',
      quality: options.quality ? options.quality / 100 : 1,
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `canvas-export.${options.format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore original dimensions
    stage.width(originalWidth);
    stage.height(originalHeight);
    stage.scale({ x: 1, y: 1 });
    
    console.log('Konva canvas exported successfully');
  } catch (error) {
    console.error('Error exporting Konva canvas:', error);
    throw error;
  }
};

// Alternative export method that works with the canvas state
export const exportCanvasState = async (
  canvasState: CanvasState,
  options: ExportOptions
): Promise<void> => {
  try {
    console.log('Exporting canvas state with options:', options);
    
    // Create a temporary canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }

    // Set canvas dimensions
    canvas.width = options.width || canvasState.width;
    canvas.height = options.height || canvasState.height;
    
    // Set background
    ctx.fillStyle = canvasState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TODO: Render layers to the canvas
    // This is a simplified version - you might want to implement proper layer rendering
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `canvas-export.${options.format}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, options.format === 'jpg' ? 'image/jpeg' : 'image/png', options.quality ? options.quality / 100 : 1);
    
    console.log('Canvas state exported successfully');
  } catch (error) {
    console.error('Error exporting canvas state:', error);
    throw error;
  }
};
