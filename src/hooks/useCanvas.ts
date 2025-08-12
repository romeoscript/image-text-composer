import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, Text } from 'fabric';
import { initializeCanvas, updateCanvasFromState, getCanvasState } from '../lib/canvas/fabricSetup';
import { CanvasState, Layer } from '../lib/utils/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_BACKGROUND } from '../lib/utils/constants';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_CANVAS_BACKGROUND,
    layers: [],
    selectedLayerId: null,
  });

  // Track if we're currently updating to prevent race conditions
  const isUpdatingRef = useRef(false);
  
  // Create a stable reference to the fabric canvas
  const fabricCanvasRefStable = useRef<Canvas | null>(null);

  // Custom text editor function - hybrid approach for compatibility
  const createTextEditor = useCallback((canvas: Canvas, textObject: any) => { // 'any' for type bypass
    console.log('Creating inline text editor overlay...');
    
    try {
      // Get canvas position and zoom for proper positioning
      const canvasElement = canvas.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();
      const zoom = canvas.getZoom();
      
      // Calculate absolute position on the page
      const left = (textObject.left || 0) * zoom + canvasRect.left;
      const top = (textObject.top || 0) * zoom + canvasRect.top;
      
      // Get text properties
      const fontSize = (textObject.fontSize || 24) * zoom;
      const fontFamily = textObject.fontFamily || 'Arial, sans-serif';
      const text = textObject.text || '';
      
      // Create a temporary span to measure text dimensions
      const tempSpan = document.createElement('span');
      tempSpan.style.fontFamily = fontFamily;
      tempSpan.style.fontSize = `${fontSize}px`;
      tempSpan.style.fontWeight = textObject.fontWeight || 'normal';
      tempSpan.style.fontStyle = textObject.fontStyle || 'normal';
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.textContent = text;
      document.body.appendChild(tempSpan);
      
      const textWidth = tempSpan.offsetWidth;
      const textHeight = tempSpan.offsetHeight;
      document.body.removeChild(tempSpan);
      
      // Create the textarea overlay
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.left = `${left}px`;
      input.style.top = `${top}px`;
      input.style.width = `${textWidth + 16}px`; // Add some padding
      input.style.height = `${textHeight + 8}px`;
      input.style.fontFamily = fontFamily;
      input.style.fontSize = `${fontSize}px`;
      input.style.fontWeight = textObject.fontWeight || 'normal';
      input.style.fontStyle = textObject.fontStyle || 'normal';
      input.style.color = textObject.fill || '#000000';
      input.style.textAlign = textObject.textAlign || 'left';
      input.style.border = 'none'; // No border for seamless look
      input.style.outline = 'none'; // No outline on focus
      input.style.borderRadius = '0px'; // No rounded corners
      input.style.padding = '0px'; // No padding for exact positioning
      input.style.backgroundColor = 'transparent'; // Completely transparent background
      input.style.zIndex = '9999';
      input.style.resize = 'none';
      input.style.overflow = 'hidden';
      input.style.boxSizing = 'border-box';
      input.style.whiteSpace = 'nowrap';
      input.style.lineHeight = '1.2';
      input.style.caretColor = textObject.fill || '#000000'; // Match text color for cursor
      
      // Hide the original text object temporarily
      textObject.set('visible', false);
      canvas.renderAll();
      
      console.log('Textarea overlay created and positioned');
      
      document.body.appendChild(input);
      input.focus();
      input.select();
      
      const handleComplete = () => {
        const newText = input.value;
        console.log('Text editing completed:', newText);
        
        // Update the original text object
        textObject.set('text', newText);
        textObject.set('visible', true);
        canvas.renderAll();
        
        // Update canvas state
        setCanvasState(prev => ({
          ...prev,
          layers: prev.layers.map(layer => {
            if (layer.id === textObject.id && layer.type === 'text') {
              return { ...layer, text: newText };
            }
            return layer;
          }),
        }));
        
        // Remove the textarea
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
        
        console.log('Inline text editor completed');
      };
      
      // Handle Enter key and blur
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleComplete();
        }
        if (e.key === 'Escape') {
          console.log('Text editing cancelled');
          textObject.set('visible', true);
          canvas.renderAll();
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
        }
      });
      
      input.addEventListener('blur', handleComplete);
      
      // Auto-resize as user types
      const autoResize = () => {
        tempSpan.textContent = input.value;
        document.body.appendChild(tempSpan);
        const newWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        input.style.width = `${newWidth + 16}px`;
      };
      
      input.addEventListener('input', autoResize);
      
    } catch (error) {
      console.error('Error creating inline text editor:', error);
      // Show the original text object if there's an error
      textObject.set('visible', true);
      canvas.renderAll();
    }
  }, []);

  // Initialize canvas only once
  useEffect(() => {
    console.log('useEffect for canvas initialization running');
    console.log('canvasRef.current:', canvasRef.current);
    console.log('fabricCanvas:', fabricCanvasRef.current);

    // Guard against re-initialization
    if (fabricCanvasRef.current) {
      console.log('Canvas already initialized, skipping...');
      return;
    }

    if (canvasRef.current && !fabricCanvasRef.current) {
      console.log('Initializing Fabric.js canvas...');
      
      const canvas = initializeCanvas(
        canvasRef.current,
        canvasState.width,
        canvasState.height
      );
      
      fabricCanvasRef.current = canvas;
      fabricCanvasRefStable.current = canvas;

      // Set up event listeners
      canvas.on('object:modified', () => {
        if (!isUpdatingRef.current) {
          // Get the current canvas state including transforms
          const newState = getCanvasState(canvas);
          
          // Update only the transform properties (position, size, rotation) without triggering canvas recreation
          setCanvasState(prev => ({
            ...prev,
            layers: prev.layers.map(layer => {
              const updatedLayer = newState.layers.find(l => l.id === layer.id);
              if (updatedLayer) {
                return {
                  ...layer,
                  x: updatedLayer.x,
                  y: updatedLayer.y,
                  width: updatedLayer.width,
                  height: updatedLayer.height,
                  rotation: updatedLayer.rotation,
                };
              }
              return layer;
            }),
            selectedLayerId: prev.selectedLayerId,
          }));
        }
      });

      // Test basic click events first
      canvas.on('mouse:down', (e) => {
        console.log('Mouse down detected!', e);
      });

      canvas.on('mouse:up', (e) => {
        console.log('Mouse up detected!', e);
      });

      canvas.on('click', (e) => {
        console.log('Single click detected!', e);
      });

      canvas.on('mouse:dblclick', (e) => {
        console.log('=== DOUBLE-CLICK DEBUG START ===');
        console.log('Double-click detected!', e);
        console.log('Event target:', e.target);
        console.log('Target type:', typeof e.target);
        console.log('Target constructor:', e.target?.constructor?.name);
        console.log('Target type property:', (e.target as any)?.type);
        
        if (e.target) {
          console.log('All target properties:', Object.getOwnPropertyNames(e.target));
          console.log('Target prototype:', Object.getPrototypeOf(e.target));
          console.log('Target prototype constructor:', Object.getPrototypeOf(e.target)?.constructor?.name);
          
          const hasText = (e.target as any)?.text !== undefined;
          const hasFont = (e.target as any)?.fontFamily !== undefined;
          console.log('Has text property:', hasText);
          console.log('Has font property:', hasFont);
        }
        
        const isTextObject = e.target && (
          e.target instanceof Text || 
          (e.target as any)?.type === 'text' ||
          (e.target as any)?.constructor?.name === 'Text' ||
          (e.target as any)?.__proto__?.constructor?.name === 'Text' ||
          (e.target as any)?.text !== undefined
        );
        
        console.log('Is text object?', isTextObject);
        console.log('Type check:', (e.target as any)?.type === 'text');
        console.log('Text property check:', (e.target as any)?.text !== undefined);
        
        if (isTextObject) {
          console.log('Text object detected! Making it editable...');
          console.log('About to call createTextEditor...');
          console.log('createTextEditor function:', createTextEditor);
          console.log('createTextEditor type:', typeof createTextEditor);
          try {
            const textObject = e.target as any;
            createTextEditor(canvas, textObject);
            console.log('createTextEditor called successfully');
          } catch (error) {
            console.error('Error calling createTextEditor:', error);
          }
        } else {
          console.log('Target is not a text object:', e.target);
          console.log('Available properties:', Object.keys(e.target || {}));
        }
        console.log('=== DOUBLE-CLICK DEBUG END ===');
      });

      // Remove the broken editing:exited event
      // canvas.on('editing:exited', (e: any) => { ... });

      canvas.on('object:moving', () => {
        // Don't update state during movement, only on completion
      });

      canvas.on('object:scaling', () => {
        // Don't update state during scaling, only on completion
      });

      canvas.on('object:rotating', () => {
        // Don't update state during rotation, only on completion
      });

      canvas.on('selection:created', (e) => {
        if (!isUpdatingRef.current && e.selected && e.selected.length > 0) {
          const selectedId = e.selected[0].get('id');
          setCanvasState(prev => ({ ...prev, selectedLayerId: selectedId }));
        }
      });

      canvas.on('selection:cleared', () => {
        if (!isUpdatingRef.current) {
          setCanvasState(prev => ({ ...prev, selectedLayerId: null }));
        }
      });

      canvas.on('object:removed', () => {
        if (!isUpdatingRef.current) {
          const newState = getCanvasState(canvas);
          setCanvasState(newState);
        }
      });

      console.log('Canvas initialized:', canvas);
      console.log('Setting up event listeners...');
      try {
        console.log('Event listener test successful');
      } catch (error) {
        console.error('Event listener test failed:', error);
      }
      setIsCanvasReady(true);
      console.log('Canvas is now ready for use');
      
      const canvasElement = canvas.getElement();
      if (canvasElement) {
        console.log('Testing DOM-level events on canvas element');
      } else {
        console.log('No canvas element found');
      }
    }

    // Cleanup function - only run when component unmounts
    return () => {
      console.log('Cleanup effect running - component unmounting');
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        fabricCanvasRefStable.current = null;
        setIsCanvasReady(false);
      }
    };
  }, []); // Empty dependency array - only run once

  // Update canvas when state changes (but only if canvas is ready)
  useEffect(() => {
    console.log('useEffect for layers change running');
    console.log('fabricCanvas:', !!fabricCanvasRef.current);
    console.log('isCanvasReady:', isCanvasReady);
    console.log('layers count:', canvasState.layers.length);

    if (fabricCanvasRef.current && isCanvasReady) {
      console.log('Updating canvas with layers...');
      isUpdatingRef.current = true;
      
      updateCanvasFromState(fabricCanvasRef.current, canvasState)
        .then(() => {
          console.log('Canvas updated successfully');
          isUpdatingRef.current = false;
        })
        .catch((error) => {
          console.error('Error updating canvas:', error);
          isUpdatingRef.current = false;
        });
    } else {
      console.log('Canvas not ready yet. Waiting...');
    }
  }, [canvasState.layers]); // Remove isCanvasReady from dependencies

  const updateCanvasSize = useCallback((width: number, height: number) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      fabricCanvasRef.current.setDimensions({ width, height });
      setCanvasState(prev => ({ ...prev, width, height }));
    }
  }, [isCanvasReady]);

  const setBackgroundColor = useCallback((color: string) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      fabricCanvasRef.current.backgroundColor = color;
      fabricCanvasRef.current.renderAll();
      setCanvasState(prev => ({ ...prev, backgroundColor: color }));
    }
  }, [isCanvasReady]);

  const addLayer = useCallback((layer: Layer) => {
    console.log('addLayer called with:', layer);
    setCanvasState(prev => {
      const newState = {
        ...prev,
        layers: [...prev.layers, layer],
      };
      console.log('New canvas state:', newState);
      return newState;
    });
  }, []);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    if (!isCanvasReady) return;
    
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } as Layer : layer
      ),
    }));
  }, [isCanvasReady]);

  const removeLayer = useCallback((layerId: string) => {
    if (!isCanvasReady) return;
    
    setCanvasState(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId),
      selectedLayerId: prev.selectedLayerId === layerId ? null : prev.selectedLayerId,
    }));
  }, [isCanvasReady]);

  const selectLayer = useCallback((layerId: string | null) => {
    if (fabricCanvasRef.current && isCanvasReady) {
      isUpdatingRef.current = true;
      
      if (layerId) {
        const objects = fabricCanvasRef.current.getObjects();
        const targetObject = objects.find(obj => obj.get('id') === layerId);
        if (targetObject) {
          fabricCanvasRef.current.setActiveObject(targetObject);
        }
      } else {
        fabricCanvasRef.current.discardActiveObject();
      }
      
      fabricCanvasRef.current.renderAll();
      setCanvasState(prev => ({ ...prev, selectedLayerId: layerId }));
      
      // Small delay to prevent race conditions
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    }
  }, [isCanvasReady]);

  const getSelectedLayer = useCallback(() => {
    if (!canvasState.selectedLayerId) return null;
    return canvasState.layers.find(layer => layer.id === canvasState.selectedLayerId);
  }, [canvasState.selectedLayerId, canvasState.layers]);

  const clearCanvas = useCallback(() => {
    if (fabricCanvasRef.current && isCanvasReady) {
      isUpdatingRef.current = true;
      fabricCanvasRef.current.clear();
      setCanvasState(prev => ({
        ...prev,
        layers: [],
        selectedLayerId: null,
      }));
      isUpdatingRef.current = false;
    }
  }, [isCanvasReady]);

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRefStable.current,
    isCanvasReady,
    canvasState,
    updateCanvasSize,
    setBackgroundColor,
    addLayer,
    updateLayer,
    removeLayer,
    selectLayer,
    getSelectedLayer,
    clearCanvas,
  };
};