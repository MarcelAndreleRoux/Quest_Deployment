// app/admin/page-builder/pageComponent.tsx
"use client";

import { ImageContent, RestorationContent } from "@/lib/types";
import { ComponentData } from "@/lib/types";
import {
  HeadingComponent,
  ParagraphComponent,
  ImageComponent,
  RestorationComponent,
} from "./components";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { GripVertical, X } from "lucide-react";
import { DetailsComponent } from "./components/detailsComponent";
import { ArtifactDetails } from "@/lib/types";

interface PageComponentProps {
  component: ComponentData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string | ImageContent | RestorationContent | ArtifactDetails) => void;
  dragAttributes?: React.HTMLAttributes<HTMLDivElement>;
  dragListeners?: SyntheticListenerMap;
  onEditPoints: (component: ComponentData) => void;
}

export const PageComponent = ({
  component,
  onDelete,
  onUpdate,
  dragAttributes,
  dragListeners,
  onEditPoints,
}: PageComponentProps) => {
  console.log('PageComponent rendered with:', component);
  
  const handleUpdate = (content: string | ImageContent | RestorationContent | ArtifactDetails) => {
    console.log('handleUpdate called with:', content);
    onUpdate(component.id, content);
  };

  return (
    <div className="group relative">
      {/* Delete Button - Outside container, top right */}
      <button
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 flex items-center justify-center hover:scale-110 shadow-lg"
        onClick={() => onDelete(component.id)}
        aria-label="Delete component"
        title="Delete component"
      >
        <X size={14} />
      </button>

      {/* Main Component Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200">
        {/* Drag Handle - Inside container, left side */}
        <div
          className="absolute top-4 left-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          {...dragAttributes}
          {...dragListeners}
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical size={20} className="text-gray-400 hover:text-gray-600" />
        </div>

        {/* Component Content */}
        <div className="p-6 pl-12">
          {component.type === "heading" && (
            <HeadingComponent
              content={component.content as string}
              onUpdate={handleUpdate}
            />
          )}

          {component.type === "paragraph" && (
            <ParagraphComponent
              content={component.content as string}
              onUpdate={handleUpdate}
            />
          )}

          {component.type === "image" && (
            <ImageComponent
              content={
                (component.content as ImageContent) || {
                  url: "",
                  points: [],
                  texts: [],
                }
              }
              onUpdate={handleUpdate}
              onEditPoints={() => onEditPoints(component)}
            />
          )}

          {component.type === "details" && (
            <DetailsComponent
              content={
                (component.content as ArtifactDetails) || {
                  created: "",
                  origin: "",
                  dimensions: "",
                  materials: ""
                }
              }
              onUpdate={handleUpdate}
            />
          )}

          {component.type === "restoration" && (
            <RestorationComponent
              content={
                (component.content as RestorationContent) || {
                  restorations: []
                }
              }
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};