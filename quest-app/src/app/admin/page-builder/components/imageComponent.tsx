"use client";

import { useCallback, useRef, useState } from "react";
import { ImageContent } from "@/lib/types";
import Image from "next/image";

export const ImageComponent = ({
  content,
  onUpdate,
  onEditPoints,
}: {
  content: ImageContent;
  onUpdate: (content: ImageContent) => void;
  onEditPoints: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({
          ...content,
          url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [content, onUpdate]
  );

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

      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <div
        className={`relative w-full aspect-video border-2 rounded-lg cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-dashed border-gray-300"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {content.url ? (
          <Image
            src={content.url}
            alt="Preview"
            fill
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Click to select or drag & drop image
          </div>
        )}
      </div>

      {content.url && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={onEditPoints}
        >
          Edit Points
        </button>
      )}
    </div>
  );
};
