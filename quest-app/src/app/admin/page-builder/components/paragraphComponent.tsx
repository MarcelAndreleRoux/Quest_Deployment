// app/admin/page-builder/components/ParagraphComponent.tsx
"use client";
import { useState } from "react";

interface ParagraphProps {
  content: string;
  onUpdate: (content: string) => void;
}

export const ParagraphComponent = ({ content, onUpdate }: ParagraphProps) => {
  const [localContent, setLocalContent] = useState(content);

  return (
    <textarea
      value={localContent}
      onChange={(e) => setLocalContent(e.target.value)}
      onBlur={() => onUpdate(localContent)}
      className="w-full h-32 p-2 border rounded focus:outline-none"
      placeholder="Enter paragraph..."
    />
  );
};