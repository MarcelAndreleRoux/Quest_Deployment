// app/admin/page-builder/dropZone.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ComponentData } from "@/lib/types";
import { SortableComponent } from "./sortableComponent";
import { ImageContent } from "@/lib/types";
import { RestorationContent } from "@/lib/types";
import { ArtifactDetails } from "@/lib/types";

interface DropZoneProps {
  components: ComponentData[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string | ImageContent | RestorationContent | ArtifactDetails) => void;
  onEditPoints: (component: ComponentData) => void;
}

export const DropZone = ({
  components,
  onDelete,
  onUpdate,
  onEditPoints,
}: DropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "dropzone" });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-4 ${isOver ? "bg-blue-50" : "bg-white"} border-l`}
    >
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-bold mb-4">Page Builder</h3>
        <SortableContext
          items={components}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {components.map((component) => (
              <SortableComponent
                key={component.id}
                component={component}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onEditPoints={onEditPoints}
              />
            ))}
          </div>
        </SortableContext>
        {components.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Drag components here to start building
          </p>
        )}
      </div>
    </div>
  );
};
