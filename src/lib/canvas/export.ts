import { Canvas } from 'fabric';
import { ExportOptions } from '../utils/types';
import { downloadFile } from '../utils/helpers';

export const exportCanvas = (
  canvas: Canvas,
  options: ExportOptions
): void => {
  const { format, quality, width, height, scale } = options;
  
  // Set canvas dimensions for export
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  if (width && height) {
    canvas.setDimensions({ width, height });
  }
  
  // Scale canvas if needed
  if (scale !== 1) {
    canvas.setZoom(scale);
  }
  
  let dataUrl: string;
  
  switch (format) {
    case 'png':
      dataUrl = canvas.toDataURL({
        format: 'png',
        quality: quality / 100,
        multiplier: scale,
      });
      break;
    case 'jpg':
      dataUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: quality / 100,
        multiplier: scale,
      });
      break;
    case 'svg':
      dataUrl = canvas.toSVG();
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `canvas-export-${timestamp}.${format}`;
  
  // Download file
  downloadFile(dataUrl, filename);
  
  // Restore original canvas dimensions and zoom
  canvas.setDimensions({ width: originalWidth, height: originalHeight });
  canvas.setZoom(1);
  canvas.renderAll();
};

export const exportCanvasAsBlob = (
  canvas: Canvas,
  options: ExportOptions
): Promise<Blob> => {
  return new Promise((resolve) => {
    const { format, quality, width, height, scale } = options;
    
    // Set canvas dimensions for export
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    if (width && height) {
      canvas.setDimensions({ width, height });
    }
    
    // Scale canvas if needed
    if (scale !== 1) {
      canvas.setZoom(scale);
    }
    
    let dataUrl: string;
    
    switch (format) {
      case 'png':
        dataUrl = canvas.toDataURL({
          format: 'png',
          quality: quality / 100,
          multiplier: scale,
        });
        break;
      case 'jpg':
        dataUrl = canvas.toDataURL({
          format: 'jpeg',
          quality: quality / 100,
          multiplier: scale,
        });
        break;
      case 'svg':
        dataUrl = canvas.toSVG();
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Convert data URL to blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    
    // Restore original canvas dimensions and zoom
    canvas.setDimensions({ width: originalWidth, height: originalHeight });
    canvas.setZoom(1);
    canvas.renderAll();
    
    resolve(blob);
  });
}; 