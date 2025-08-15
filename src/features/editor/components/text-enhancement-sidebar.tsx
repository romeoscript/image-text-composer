"use client";

import { useState, useEffect } from "react";
import { Editor, ActiveTool } from "@/features/editor/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Hint } from "@/components/hint";
import { 
  Type, 
  ArrowUpDown, 
  ArrowLeftRight,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TextEnhancementSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TextEnhancementSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextEnhancementSidebarProps) => {
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.3)");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);

  // Update local state when editor selection changes
  useEffect(() => {
    if (editor && editor.selectedObjects.length > 0) {
      const selectedObject = editor.selectedObjects[0];
      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        // @ts-ignore
        const currentLineHeight = selectedObject.get("lineHeight") || 1.2;
        // @ts-ignore
        const currentLetterSpacing = selectedObject.get("charSpacing") || 0;
        const currentShadow = selectedObject.get("shadow");
        
        setLineHeight(currentLineHeight);
        setLetterSpacing(currentLetterSpacing);
        setShadowEnabled(!!currentShadow);
        
        if (currentShadow && typeof currentShadow !== 'string') {
          setShadowColor(currentShadow.color || "rgba(0,0,0,0.3)");
          setShadowBlur(currentShadow.blur || 4);
          setShadowOffsetX(currentShadow.offsetX || 2);
          setShadowOffsetY(currentShadow.offsetY || 2);
        }
      }
    }
  }, [editor?.selectedObjects]);

  const handleLineHeightChange = (value: number) => {
    setLineHeight(value);
    editor?.changeLineHeight(value);
  };

  const handleLetterSpacingChange = (value: number) => {
    setLetterSpacing(value);
    editor?.changeLetterSpacing(value);
  };

  const handleShadowToggle = () => {
    const newEnabled = !shadowEnabled;
    setShadowEnabled(newEnabled);
    
    if (newEnabled) {
      editor?.changeTextShadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        enabled: true
      });
    } else {
      editor?.changeTextShadow({ enabled: false });
    }
  };

  const handleShadowColorChange = (color: string) => {
    setShadowColor(color);
    if (shadowEnabled) {
      editor?.changeTextShadow({
        color,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        enabled: true
      });
    }
  };

  const handleShadowBlurChange = (blur: number) => {
    setShadowBlur(blur);
    if (shadowEnabled) {
      editor?.changeTextShadow({
        color: shadowColor,
        blur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
        enabled: true
      });
    }
  };

  const handleShadowOffsetXChange = (offsetX: number) => {
    setShadowOffsetX(offsetX);
    if (shadowEnabled) {
      editor?.changeTextShadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX,
        offsetY: shadowOffsetY,
        enabled: true
      });
    }
  };

  const handleShadowOffsetYChange = (offsetY: number) => {
    setShadowOffsetY(offsetY);
    if (shadowEnabled) {
      editor?.changeTextShadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY,
        enabled: true
      });
    }
  };

  const isTextSelected = editor?.selectedObjects.some(obj => 
    obj.type === "textbox" || obj.type === "text"
  );

  if (!isTextSelected) {
    return null;
  }

  return (
    <div className={cn(
      "absolute h-full w-[300px] bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
      activeTool === "text-enhancement" ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Type className="w-5 h-5" />
            Text Enhancement
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChangeActiveTool("select")}
          >
            ×
          </Button>
        </div>

        {/* Line Height */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Line Height
            </Label>
            <Input
              type="number"
              value={lineHeight}
              onChange={(e) => handleLineHeightChange(parseFloat(e.target.value) || 1.2)}
              className="w-20 h-8 text-sm"
              step="0.1"
              min="0.5"
              max="3.0"
            />
          </div>
          <Slider
            value={[lineHeight]}
            onValueChange={([value]) => handleLineHeightChange(value)}
            min={0.5}
            max={3.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Letter Spacing
            </Label>
            <Input
              type="number"
              value={letterSpacing}
              onChange={(e) => handleLetterSpacingChange(parseInt(e.target.value) || 0)}
              className="w-20 h-8 text-sm"
              step="1"
              min="-20"
              max="50"
            />
          </div>
          <Slider
            value={[letterSpacing]}
            onValueChange={([value]) => handleLetterSpacingChange(value)}
            min={-20}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Text Shadow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Text Shadow
            </Label>
            <Button
              variant={shadowEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleShadowToggle}
              className="flex items-center gap-2"
            >
              {shadowEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {shadowEnabled ? "On" : "Off"}
            </Button>
          </div>

          {shadowEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              {/* Shadow Color */}
              <div className="space-y-2">
                <Label className="text-sm">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => handleShadowColorChange(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={shadowColor}
                    onChange={(e) => handleShadowColorChange(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
              </div>

              {/* Shadow Blur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Blur</Label>
                  <Input
                    type="number"
                    value={shadowBlur}
                    onChange={(e) => handleShadowBlurChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-sm"
                    min="0"
                    max="50"
                  />
                </div>
                <Slider
                  value={[shadowBlur]}
                  onValueChange={([value]) => handleShadowBlurChange(value)}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Shadow Offset X */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Offset X</Label>
                  <Input
                    type="number"
                    value={shadowOffsetX}
                    onChange={(e) => handleShadowOffsetXChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-sm"
                    min="-50"
                    max="50"
                  />
                </div>
                <Slider
                  value={[shadowOffsetX]}
                  onValueChange={([value]) => handleShadowOffsetXChange(value)}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Shadow Offset Y */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Offset Y</Label>
                  <Input
                    type="number"
                    value={shadowOffsetY}
                    onChange={(e) => handleShadowOffsetYChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-sm"
                    min="-50"
                    max="50"
                  />
                </div>
                <Slider
                  value={[shadowOffsetY]}
                  onValueChange={([value]) => handleShadowOffsetYChange(value)}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
