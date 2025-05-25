"use client";

import Image from "next/image";
import { Award, Upload, X } from "lucide-react";

type Prize = {
  title?: string;
  description?: string;
  imagePreview?: string;
};

type PrizeSectionProps = {
  showPrize: boolean;
  prize: Prize;
  imagePreview: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onTogglePrize: () => void;
  onSetPrize: (field: "title" | "description", value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

export const PrizeSection = ({
  showPrize,
  prize,
  imagePreview,
  fileInputRef,
  onTogglePrize,
  onSetPrize,
  onImageUpload,
  onRemoveImage,
  onDragOver,
  onDrop,
}: PrizeSectionProps) => (
  <div className="mb-8">
    <button
      className="flex items-center gap-2 mb-4 text-indigo-600 font-medium"
      onClick={onTogglePrize}
    >
      <Award size={18} />
      {showPrize ? "Hide Prize Details" : "Add Prize Details (Optional)"}
    </button>

    {showPrize && (
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Title
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="What will the player win?"
            value={prize.title || ""}
            onChange={(e) => onSetPrize("title", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Description
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg h-24"
            placeholder="Describe the prize in detail..."
            value={prize.description || ""}
            onChange={(e) => onSetPrize("description", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageUpload}
          />

          {imagePreview ? (
            <div className="relative w-full h-48 flex items-center justify-center border border-gray-300 rounded-lg">
              <Image
                src={imagePreview}
                alt="Prize preview"
                className="object-contain"
                fill
                style={{ objectFit: "contain" }}
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                onClick={onRemoveImage}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <Upload size={36} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Drag & drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
