// app/admin/page-builder/componentList.tsx
"use client";
import React from "react";
import { ComponentData } from "@/lib/types";
import { DraggableComponent } from "./draggableComponent";

const basicComponents: ComponentData[] = [
  { id: "1", type: "heading", content: "Heading" },
  { id: "2", type: "paragraph", content: "Paragraph" },
  {
    id: "3",
    type: "image",
    content: {
      url: "",
      points: [],
    },
  },
  {
    id: "5",
    type: "details",
    content: {
      created: "",
      origin: "",      currentLocation: "",
      dimensions: "",
      materials: ""
    },
  },
];

const advancedComponents: ComponentData[] = [
  {
    id: "4",
    type: "restoration",
    content: {
      restorations: [],
    },
  },
];

export const ComponentList = () => {
  return (
    <div className="p-4 border-r">
      <h3 className="text-lg font-bold mb-4">Available Components</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Basic Components</h4>
          <div className="space-y-2">
            {basicComponents.map((component) => (
              <DraggableComponent
                key={component.id}
                component={component}
                displayName={capitalize(component.type)}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Advanced Components</h4>
          <div className="space-y-2">
            {advancedComponents.map((component) => (
              <DraggableComponent
                key={component.id}
                component={component}
                displayName={"Restoration"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
