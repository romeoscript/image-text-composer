import { useState, useEffect } from 'react';

export interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
  subsets: string[];
}

export const useGoogleFonts = () => {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        setLoading(true);
        
        // TODO: Get a proper Google Fonts API key from:
        // https://developers.google.com/fonts/docs/developer_api
        // For now, we'll use a placeholder key that will fail gracefully
        const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDIf9X3nxHznmwhX1aLDx93_vyB4HAlIus');
        
        if (!response.ok) {
          // If API key fails, fall back to a curated list of popular Google Fonts
          const fallbackFonts: GoogleFont[] = [
            { family: 'Roboto', variants: ['300', '400', '500', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Open Sans', variants: ['300', '400', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Lato', variants: ['300', '400', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Poppins', variants: ['300', '400', '500', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Montserrat', variants: ['300', '400', '500', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Inter', variants: ['300', '400', '500', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Source Sans Pro', variants: ['300', '400', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Ubuntu', variants: ['300', '400', '500', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Nunito', variants: ['300', '400', '600', '700'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Playfair Display', variants: ['400', '500', '600', '700'], category: 'serif', subsets: ['latin'] },
            { family: 'Merriweather', variants: ['300', '400', '700'], category: 'serif', subsets: ['latin'] },
            { family: 'Lora', variants: ['400', '500', '600', '700'], category: 'serif', subsets: ['latin'] },
            { family: 'Source Code Pro', variants: ['300', '400', '500', '600', '700'], category: 'monospace', subsets: ['latin'] },
            { family: 'Fira Code', variants: ['300', '400', '500', '600', '700'], category: 'monospace', subsets: ['latin'] },
            { family: 'JetBrains Mono', variants: ['300', '400', '500', '600', '700'], category: 'monospace', subsets: ['latin'] },
            // Add some classic fonts as fallback
            { family: 'Arial', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Helvetica', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Times New Roman', variants: ['400'], category: 'serif', subsets: ['latin'] },
            { family: 'Georgia', variants: ['400'], category: 'serif', subsets: ['latin'] },
            { family: 'Verdana', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
            { family: 'Courier New', variants: ['400'], category: 'monospace', subsets: ['latin'] },
          ];
          setFonts(fallbackFonts);
          setLoading(false);
          console.log('Using fallback fonts. Get a Google Fonts API key for full access to 1000+ fonts.');
          return;
        }

        const data = await response.json();
        setFonts(data.items || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Google Fonts:', err);
        setError('Failed to load fonts');
        setLoading(false);
        
        // Fallback to basic fonts
        const basicFonts: GoogleFont[] = [
          { family: 'Arial', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
          { family: 'Helvetica', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
          { family: 'Times New Roman', variants: ['400'], category: 'serif', subsets: ['latin'] },
          { family: 'Georgia', variants: ['400'], category: 'serif', subsets: ['latin'] },
          { family: 'Verdana', variants: ['400'], category: 'sans-serif', subsets: ['latin'] },
          { family: 'Courier New', variants: ['400'], category: 'monospace', subsets: ['latin'] },
        ];
        setFonts(basicFonts);
      }
    };

    fetchFonts();
  }, []);

  // Load fonts into the document
  useEffect(() => {
    if (fonts.length > 0) {
      fonts.forEach(font => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}:wght@400&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      });
    }
  }, [fonts]);

  return { fonts, loading, error };
}; 