// app/admin/page-builder/draggableComponent.tsx
"use client";
import { useDraggable } from "@dnd-kit/core";
import { ComponentData } from "@/lib/types";

interface DraggableProps {
  component: ComponentData;
  displayName?: string;
}

export const DraggableComponent = ({ component, displayName }: DraggableProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: component.id,
    data: {
      type: component.type,
      isNew: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 bg-gray-100 border rounded cursor-move hover:bg-gray-200 transition-colors"
    >
      {displayName || capitalize(component.type)}
    </div>
  );
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
