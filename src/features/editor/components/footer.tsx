import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { Editor } from "@/features/editor/types";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

interface FooterProps {
  editor: Editor | undefined;
};

export const Footer = ({ editor }: FooterProps) => {
  const activeFontFamily = editor?.getActiveFontFamily();
  const activeFontWeight = editor?.getActiveFontWeight();
  
  return (
    <footer className="h-[52px] border-t bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-1 shrink-0 px-4 flex-row-reverse">
      <Hint label="Reset to Blank Canvas" side="top" sideOffset={10}>
        <Button
          onClick={() => {
            if (confirm('Are you sure you want to reset to a blank canvas? This will clear all your work and cannot be undone.')) {
              editor?.clearLocalStorage();
            }
          }}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <RotateCcw className="size-4" />
        </Button>
      </Hint>
      <Hint label="Zoom in" side="top" sideOffset={10}>
        <Button
          onClick={() => editor?.zoomIn()}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <ZoomIn className="size-4" />
        </Button>
      </Hint>
      <Hint label="Zoom out" side="top" sideOffset={10}>
        <Button
          onClick={() => editor?.zoomOut()}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <ZoomOut className="size-4" />
        </Button>
      </Hint>
      
      {/* Font Information Display */}
      {activeFontFamily && (
        <div className="text-xs text-muted-foreground mr-4 flex items-center gap-2">
          <span className="font-medium">Font:</span>
          <span style={{ fontFamily: activeFontFamily }}>{activeFontFamily}</span>
          {activeFontWeight && (
            <>
              <span className="font-medium">Weight:</span>
              <span>{activeFontWeight}</span>
            </>
          )}
        </div>
      )}
      
      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground mr-4">
        <span className="font-medium">Nudge:</span> Arrow keys (Shift + Arrow = 10px)
      </div>
      
      {/* Nudge Amount Display */}
      <div className="text-xs text-muted-foreground mr-4">
        <span className="font-medium">Nudge Amount:</span> 1px / 10px
      </div>
    </footer>
  );
};
