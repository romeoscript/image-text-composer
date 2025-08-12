export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 600;
export const DEFAULT_CANVAS_BACKGROUND = '#ffffff';

export const DEFAULT_TEXT_LAYER = {
  fontSize: 24,
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#000000',
  textAlign: 'left',
  underline: false,
  linethrough: false,
  opacity: 1,
  rotation: 0,
};

export const DEFAULT_FONT_FAMILY = 'Arial, sans-serif';

export const FONT_WEIGHTS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900'
];

export const FONT_STYLES = ['normal', 'italic'];

export const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];

export const CANVAS_SIZES = [
  { name: 'Custom', width: 0, height: 0 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'A4 Portrait', width: 794, height: 1123 },
  { name: 'A4 Landscape', width: 1123, height: 794 },
];

export const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG', description: 'Best for web and transparency' },
  { value: 'jpg', label: 'JPEG', description: 'Best for photos and smaller files' },
  { value: 'svg', label: 'SVG', description: 'Scalable vector format' },
];

export const MAX_HISTORY_STATES = 50;
export const AUTOSAVE_INTERVAL = 5000; // 5 seconds 