// app/admin/page-builder/components/HeadingComponent.tsx
"use client";
import { useState } from "react";

interface HeadingProps {
  content: string;
  onUpdate: (content: string) => void;
}

export const HeadingComponent = ({ content, onUpdate }: HeadingProps) => {
  const [localContent, setLocalContent] = useState(content);

  return (
    <input
      value={localContent}
      onChange={(e) => setLocalContent(e.target.value)}
      onBlur={() => onUpdate(localContent)}
      className="text-2xl font-bold w-full border-b focus:outline-none"
      placeholder="Enter heading..."
    />
  );
};