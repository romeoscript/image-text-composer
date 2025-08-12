import { useEffect, useRef, useCallback } from 'react';
import { CanvasState } from '../lib/utils/types';
import { saveToLocalStorage } from '../lib/storage/localStorage';
import { AUTOSAVE_INTERVAL } from '../lib/utils/constants';

export const useAutosave = (canvasState: CanvasState, enabled: boolean = true) => {
  const lastSavedStateRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced save function
  const debouncedSave = useCallback((state: CanvasState) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const stateString = JSON.stringify(state);
      if (stateString !== lastSavedStateRef.current) {
        saveToLocalStorage(state);
        lastSavedStateRef.current = stateString;
        console.log('Canvas state autosaved');
      }
    }, 1000);
  }, []);

  // Save on state change
  useEffect(() => {
    if (enabled) {
      debouncedSave(canvasState);
    }
  }, [canvasState, debouncedSave, enabled]);

  // Periodic save as backup
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const stateString = JSON.stringify(canvasState);
      if (stateString !== lastSavedStateRef.current) {
        saveToLocalStorage(canvasState);
        lastSavedStateRef.current = stateString;
        console.log('Canvas state periodically saved');
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [canvasState, enabled]);

  // Manual save function
  const saveNow = useCallback(() => {
    saveToLocalStorage(canvasState);
    lastSavedStateRef.current = JSON.stringify(canvasState);
    console.log('Canvas state manually saved');
  }, [canvasState]);

  return {
    saveNow,
    lastSaved: lastSavedStateRef.current !== '',
  };
}; 