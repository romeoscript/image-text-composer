import { useState, useCallback, useRef } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useSaveStatus = () => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startSaving = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus("saving");
  }, []);

  const completeSave = useCallback(() => {
    setStatus("saved");
    
    // Auto-hide the "saved" status after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
    }, 2000);
  }, []);

  const errorSave = useCallback(() => {
    setStatus("error");
    
    // Auto-hide the error status after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }, []);

  const resetStatus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus("idle");
  }, []);

  return {
    status,
    startSaving,
    completeSave,
    errorSave,
    resetStatus,
  };
};
