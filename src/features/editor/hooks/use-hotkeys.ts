import { fabric } from "fabric";
import { useEvent } from "react-use";

interface UseHotkeysProps {
  canvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  copy: () => void;
  paste: () => void;
  snapToCenter: () => void;
}

export const useHotkeys = ({ canvas, undo, redo, save, copy, paste, snapToCenter }: UseHotkeysProps) => {
  useEvent("keydown", (event) => {
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isBackspace = event.key === "Backspace";
    const isInput = ["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName);

    if (isInput) return;

    // delete key
    if (event.keyCode === 46) {
      canvas?.getActiveObjects().forEach((Object) => canvas?.remove(Object));
      canvas?.discardActiveObject();
      canvas?.renderAll();
    }

    if (isBackspace) {
      canvas?.remove(...canvas.getActiveObjects());
      canvas?.discardActiveObject();
    }

    if (isCtrlKey && event.key === "z") {
      event.preventDefault();
      undo();
    }

    if (isCtrlKey && event.key === "y") {
      event.preventDefault();
      redo();
    }

    if (isCtrlKey && event.key === "c") {
      event.preventDefault();
      copy();
    }

    if (isCtrlKey && event.key === "v") {
      event.preventDefault();
      paste();
    }

    if (isCtrlKey && event.key === "s") {
      event.preventDefault();
      save(true);
    }

    if (isCtrlKey && event.key === "a") {
      event.preventDefault();
      canvas?.discardActiveObject();

      const allObjects = canvas?.getObjects().filter((object) => object.selectable);

      canvas?.setActiveObject(new fabric.ActiveSelection(allObjects, { canvas }));
      canvas?.renderAll();
    }

    if (isCtrlKey && event.key === "m") {
      event.preventDefault();
      snapToCenter();
    }

    // Additional snap shortcuts
    if (isCtrlKey && event.key === "1") {
      event.preventDefault();
      // This would need to be passed from the editor
      // For now, just snap to center
      snapToCenter();
    }

    // Arrow key nudging for precise positioning
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      
      const activeObjects = canvas?.getActiveObjects();
      if (activeObjects && activeObjects.length > 0) {
        const nudgeAmount = event.shiftKey ? 10 : 1; // Shift + arrow = 10px, just arrow = 1px
        
        activeObjects.forEach((obj) => {
          switch (event.key) {
            case "ArrowUp":
              obj.set({ top: obj.top! - nudgeAmount });
              break;
            case "ArrowDown":
              obj.set({ top: obj.top! + nudgeAmount });
              break;
            case "ArrowLeft":
              obj.set({ left: obj.left! - nudgeAmount });
              break;
            case "ArrowRight":
              obj.set({ left: obj.left! + nudgeAmount });
              break;
          }
        });
        
        canvas?.renderAll();
      }
    }
  });
};
