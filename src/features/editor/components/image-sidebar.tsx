"use client";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ImageUpload } from "@/features/editor/components/image-upload";

import { cn } from "@/lib/utils";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ 
  editor, 
  activeTool, 
  onChangeActiveTool 
}: ImageSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader 
        title="Images" 
        description="Upload images from your device to add to the canvas" 
      />
      
      <div className="flex-1 overflow-auto">
        <ImageUpload 
          editor={editor} 
          onClose={onClose} 
        />
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
}; 
