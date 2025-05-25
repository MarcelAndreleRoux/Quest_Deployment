// app/admin/page-builder/sortableComponent.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSSProperties } from "react";
import { ComponentData, ImageContent, RestorationContent } from "@/lib/types";
import { PageComponent } from "./pageComponent";
import { ArtifactDetails } from "@/lib/types";

interface SortableProps {
  component: ComponentData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string | ImageContent | RestorationContent | ArtifactDetails) => void;
  onEditPoints: (component: ComponentData) => void;
}

export const SortableComponent = ({
  component,
  onDelete,
  onUpdate,
  onEditPoints,
}: SortableProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: component.id,
      data: { isNew: false },
    });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PageComponent
        component={component}
        onDelete={onDelete}
        onUpdate={onUpdate}
        dragAttributes={attributes}
        dragListeners={listeners}
        onEditPoints={onEditPoints}
      />
    </div>
  );
};
