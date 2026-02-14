"use client";

/**
 * DropZone component for PDF file upload
 * 
 * Supports drag-and-drop and click-to-browse functionality
 */

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Heading, Text, Badge } from "@/components/ui";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function DropZone({ onFileSelect, isLoading }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed
        transition-all duration-200 p-12
        ${
          isDragging
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
            : "border-neutral-300 dark:border-neutral-700 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        }
        ${isLoading ? "pointer-events-none opacity-50" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        {isLoading ? (
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary-500" />
          </div>
        )}

        <div className="space-y-2">
          <Heading level={4}>
            {isLoading ? "Verifying..." : "Drop your PDF here"}
          </Heading>
          <Text variant="muted">
            {isLoading
              ? "Please wait while we verify your document"
              : "or click to browse. Only Zenland escrow PDFs are supported."}
          </Text>
        </div>

        {!isLoading && (
          <Badge variant="secondary" className="mt-2">
            <FileText className="w-3 h-3 mr-1" />
            PDF files only
          </Badge>
        )}
      </div>
    </div>
  );
}
