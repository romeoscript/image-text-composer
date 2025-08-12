import { useCallback, useRef } from 'react';
import { CanvasState, HistoryState } from '../lib/utils/types';
import { MAX_HISTORY_STATES } from '../lib/utils/constants';

export const useHistory = (initialState: CanvasState) => {
  const historyRef = useRef<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  const pushState = useCallback((newState: CanvasState) => {
    const { past, present } = historyRef.current;
    
    // Add current state to past
    const newPast = [...past, present];
    
    // Limit history size
    if (newPast.length > MAX_HISTORY_STATES) {
      newPast.shift();
    }
    
    historyRef.current = {
      past: newPast,
      present: newState,
      future: [], // Clear future when new state is pushed
    };
  }, []);

  const undo = useCallback((): CanvasState | null => {
    const { past, present, future } = historyRef.current;
    
    if (past.length === 0) return null;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    historyRef.current = {
      past: newPast,
      present: previous,
      future: [present, ...future],
    };
    
    return previous;
  }, []);

  const redo = useCallback((): CanvasState | null => {
    const { past, present, future } = historyRef.current;
    
    if (future.length === 0) return null;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    historyRef.current = {
      past: [...past, present],
      present: next,
      future: newFuture,
    };
    
    return next;
  }, []);

  const clearHistory = useCallback(() => {
    const { present } = historyRef.current;
    historyRef.current = {
      past: [],
      present,
      future: [],
    };
  }, []);

  const getHistoryInfo = useCallback(() => ({
    canUndo,
    canRedo,
    pastCount: historyRef.current.past.length,
    futureCount: historyRef.current.future.length,
  }), [canUndo, canRedo]);

  return {
    pushState,
    undo,
    redo,
    clearHistory,
    getHistoryInfo,
    canUndo,
    canRedo,
  };
}; 