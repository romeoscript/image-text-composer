import { useState, useEffect, useCallback } from 'react';
import { fetchGoogleFonts, loadGoogleFont, GoogleFont } from '@/lib/google-fonts';

export const useGoogleFonts = () => {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Fetch fonts on component mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedFonts = await fetchGoogleFonts();
        setFonts(fetchedFonts);
        
        // Pre-load some popular fonts
        const popularFonts = fetchedFonts.slice(0, 10);
        for (const font of popularFonts) {
          await loadFont(font.family);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fonts');
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  // Load a specific font
  const loadFont = useCallback(async (fontFamily: string) => {
    try {
      if (loadedFonts.has(fontFamily)) {
        return; // Font already loaded
      }

      await loadGoogleFont(fontFamily);
      setLoadedFonts(prev => new Set(prev).add(fontFamily));
    } catch (err) {
      console.error(`Failed to load font ${fontFamily}:`, err);
    }
  }, [loadedFonts]);

  // Load font on demand when user selects it
  const selectFont = useCallback(async (fontFamily: string) => {
    await loadFont(fontFamily);
  }, [loadFont]);

  // Get fonts by category
  const getFontsByCategory = useCallback((category: string) => {
    return fonts.filter(font => font.category === category);
  }, [fonts]);

  // Search fonts by name
  const searchFonts = useCallback((query: string) => {
    if (!query.trim()) return fonts;
    
    const lowerQuery = query.toLowerCase();
    return fonts.filter(font => 
      font.family.toLowerCase().includes(lowerQuery)
    );
  }, [fonts]);

  // Get popular fonts (first 20)
  const getPopularFonts = useCallback(() => {
    return fonts.slice(0, 20);
  }, [fonts]);

  return {
    fonts,
    loading,
    error,
    loadedFonts,
    loadFont,
    selectFont,
    getFontsByCategory,
    searchFonts,
    getPopularFonts,
  };
};
