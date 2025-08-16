// Google Fonts API service
// You'll need to get an API key from: https://developers.google.com/fonts/docs/developer_api

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || 'YOUR-API-KEY';
const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
}

export interface GoogleFontsResponse {
  items: GoogleFont[];
  kind: string;
}

// Fetch all available fonts from Google Fonts
export const fetchGoogleFonts = async (): Promise<GoogleFont[]> => {
  try {
    if (GOOGLE_FONTS_API_KEY === 'YOUR-API-KEY') {
      console.warn('Google Fonts API key not set. Using fallback fonts.');
      return getFallbackFonts();
    }

    const response = await fetch(
      `${GOOGLE_FONTS_API_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch fonts: ${response.status}`);
    }

    const data: GoogleFontsResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Fonts:', error);
    return getFallbackFonts();
  }
};

// Fallback fonts if API fails or key not set
export const getFallbackFonts = (): GoogleFont[] => {
  return [
    {
      family: 'Arial',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'arial.ttf',
        bold: 'arial-bold.ttf',
        italic: 'arial-italic.ttf',
        bolditalic: 'arial-bold-italic.ttf'
      },
      category: 'sans-serif',
      kind: 'webfonts#webfont'
    },
    {
      family: 'Times New Roman',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'times.ttf',
        bold: 'times-bold.ttf',
        italic: 'times-italic.ttf',
        bolditalic: 'times-bold-italic.ttf'
      },
      category: 'serif',
      kind: 'webfonts#webfont'
    },
    {
      family: 'Helvetica',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'helvetica.ttf',
        bold: 'helvetica-bold.ttf',
        italic: 'helvetica-italic.ttf',
        bolditalic: 'helvetica-bold-italic.ttf'
      },
      category: 'sans-serif',
      kind: 'webfonts#webfont'
    },
    {
      family: 'Georgia',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'georgia.ttf',
        bold: 'georgia-bold.ttf',
        italic: 'georgia-italic.ttf',
        bolditalic: 'georgia-bold-italic.ttf'
      },
      category: 'serif',
      kind: 'webfonts#webfont'
    },
    {
      family: 'Verdana',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'verdana.ttf',
        bold: 'verdana-bold.ttf',
        italic: 'verdana-italic.ttf',
        bolditalic: 'verdana-bold-italic.ttf'
      },
      category: 'sans-serif',
      kind: 'webfonts#webfont'
    },
    {
      family: 'Courier New',
      variants: ['regular', 'bold', 'italic', 'bolditalic'],
      subsets: ['latin'],
      version: '1.0',
      lastModified: '2023-01-01',
      files: {
        regular: 'courier.ttf',
        bold: 'courier-bold.ttf',
        italic: 'courier-italic.ttf',
        bolditalic: 'courier-bold-italic.ttf'
      },
      category: 'monospace',
      kind: 'webfonts#webfont'
    }
  ];
};

// Load a Google Font into the document
export const loadGoogleFont = (fontFamily: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if font is already loaded
    if (document.fonts.check(`12px "${fontFamily}"`)) {
      resolve();
      return;
    }

    // Create a link element to load the font
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.rel = 'stylesheet';
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font: ${fontFamily}`));
    
    document.head.appendChild(link);
  });
};

// Get font weights from variants
export const getFontWeights = (variants: string[]): number[] => {
  const weights: number[] = [];
  
  variants.forEach(variant => {
    if (variant === 'regular') weights.push(400);
    else if (variant === 'italic') weights.push(400);
    else if (variant.match(/^\d+$/)) weights.push(parseInt(variant));
  });
  
  // Sort weights and remove duplicates
  const uniqueWeights = Array.from(new Set(weights));
  return uniqueWeights.sort((a, b) => a - b);
};
