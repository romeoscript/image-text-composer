import { 
  ActiveTool, 
  Editor,
  FONT_WEIGHTS,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { useGoogleFonts } from "@/features/editor/hooks/use-google-fonts";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'family' | 'weight'>('family');
  const [searchQuery, setSearchQuery] = useState('');
  const fontFamily = editor?.getActiveFontFamily();
  const fontWeight = editor?.getActiveFontWeight();
  
  const { 
    fonts, 
    loading, 
    error, 
    selectFont, 
    searchFonts 
  } = useGoogleFonts();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Font"
        description={`Change the text ${activeTab === 'family' ? 'font family' : 'font weight'}`}
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b bg-gray-50 rounded-t-lg">
            <button
              onClick={() => setActiveTab('family')}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-lg",
                activeTab === 'family'
                  ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              Font Family
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-lg",
                activeTab === 'weight'
                  ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              Font Weight
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'family' && (
            <div className="space-y-1 pt-2">
              {/* Search Input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading fonts...</p>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-2">Failed to load fonts</p>
                  <p className="text-xs text-gray-500">Using fallback fonts</p>
                </div>
              )}
              
              {/* Fonts List */}
              {!loading && !error && (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {searchFonts(searchQuery).map((font) => (
                    <Button
                      key={font.family}
                      variant="secondary"
                      size="lg"
                      className={cn(
                        "w-full h-16 justify-start text-left",
                        fontFamily === font.family && "border-2 border-blue-500",
                      )}
                      style={{
                        fontFamily: font.family,
                        fontSize: "16px",
                        padding: "8px 16px"
                      }}
                      onClick={async () => {
                        await selectFont(font.family);
                        editor?.changeFontFamily(font.family);
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{font.family}</span>
                        <span className="text-xs text-gray-500 capitalize">{font.category}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'weight' && (
            <div className="space-y-1 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {FONT_WEIGHTS.map((weight) => (
                  <Button
                    key={weight.value}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "h-10 text-xs",
                      fontWeight === weight.value && "border-2 border-blue-500 bg-blue-50",
                    )}
                    onClick={() => editor?.changeFontWeight(weight.value)}
                  >
                    {weight.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Nudge Controls Section - Always Visible */}
          <div className="space-y-1 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Nudge Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('up')}
                className="h-10"
              >
                ↑ Up
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('down')}
                className="h-10"
              >
                ↓ Down
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('left')}
                className="h-10"
              >
                ← Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('right')}
                className="h-10"
              >
                → Right
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('up', 10)}
                className="h-10 text-xs"
              >
                ↑ Up (10px)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editor?.nudgeObjects('down', 10)}
                className="h-10 text-xs"
              >
                ↓ Down (10px)
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
