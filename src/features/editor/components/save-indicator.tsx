"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export const SaveIndicator = ({ status, className }: SaveIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "saved":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getText = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      default:
        return "";
    }
  };

  const getStatusColors = () => {
    switch (status) {
      case "saving":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "saved":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "opacity-0";
    }
  };

  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200",
        getStatusColors(),
        "animate-in fade-in-0 slide-in-from-top-1",
        status === "saved" && "animate-out fade-out-0 slide-out-to-top-1 duration-1000 delay-1000",
        className
      )}
    >
      {getIcon()}
      <span>{getText()}</span>
    </div>
  );
};
