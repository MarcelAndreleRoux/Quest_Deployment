"use client";

import {
  Trash,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

type ArtefactListProps = {
  artifacts: any[];
  questType: string;
  activeArtifactIndex: number | null;
  validationErrors: Record<string, string>;
  onRemoveArtifact: (index: number) => void;
  onMoveArtifact: (index: number, direction: "up" | "down") => void;
  onToggleDetails: (index: number) => void;
  onReorderArtifacts: (newOrder: any[]) => void;
  children: ReactNode;
  // Add this prop to pass the artifact lookup data
  artifactLookup?: Record<string, { name: string; description?: string }>;
};

// Define type for SortableArtifact props
type SortableArtifactProps = {
  artifact: any;
  index: number;
  questType: string;
  isActive: boolean;
  artifactsLength: number;
  onRemoveArtifact: (index: number) => void;
  onMoveArtifact: (index: number, direction: "up" | "down") => void;
  onToggleDetails: (index: number) => void;
  children?: ReactNode;
  artifactLookup?: Record<string, { name: string; description?: string }>;
};

// Sortable artifact item component
const SortableArtifact = ({
  artifact,
  index,
  questType,
  isActive,
  artifactsLength,
  onRemoveArtifact,
  onMoveArtifact,
  onToggleDetails,
  children,
  artifactLookup,
}: SortableArtifactProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artifact.artefactId || artifact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  // Get the artifact name from lookup or fallback
  const artifactName = artifactLookup?.[artifact.artefactId]?.name || 
                      artifact.name || 
                      `Artifact ${index + 1}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg overflow-hidden ${
        isDragging ? "border-indigo-400 shadow-lg" : ""
      }`}
    >
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          {questType === "sequential" && (
            <>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:text-indigo-600 mr-1"
              >
                <GripVertical size={18} />
              </div>
              <div className="flex flex-col items-center">
                <button
                  className={`text-gray-500 hover:text-indigo-600 ${
                    index === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => onMoveArtifact(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  className={`text-gray-500 hover:text-indigo-600 ${
                    index === artifactsLength - 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => onMoveArtifact(index, "down")}
                  disabled={index === artifactsLength - 1}
                >
                  <ArrowDown size={15} />
                </button>
              </div>
              <span className="text-gray-500">#{index + 1}</span>
            </>
          )}
          <h3
            className="font-medium cursor-pointer"
            onClick={() => onToggleDetails(index)}
          >
            {artifactName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {artifact.hints?.length || 0}{" "}
            {(artifact.hints?.length || 0) === 1 ? "hint" : "hints"}
          </span>
          <button
            onClick={() => onRemoveArtifact(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash size={18} />
          </button>
          <button
            onClick={() => onToggleDetails(index)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {isActive && children}
    </div>
  );
};

export const ArtefactList = ({
  artifacts,
  questType,
  activeArtifactIndex,
  validationErrors,
  onRemoveArtifact,
  onMoveArtifact,
  onToggleDetails,
  onReorderArtifacts,
  children,
  artifactLookup,
}: ArtefactListProps) => {
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = artifacts.findIndex(
        (artifact) => (artifact.artefactId || artifact.id) === active.id
      );
      const newIndex = artifacts.findIndex(
        (artifact) => (artifact.artefactId || artifact.id) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the updated order
        const newArtifactsOrder = arrayMove(artifacts, oldIndex, newIndex);

        // Call the provided reorder function with the new array
        onReorderArtifacts(newArtifactsOrder);
      }
    }
  };

  return (
    <div className="mb-8">
      {validationErrors.artifacts && (
        <p className="mb-4 text-sm text-red-500">
          {validationErrors.artifacts}
        </p>
      )}

      {artifacts.length > 0 ? (
        <div className="space-y-3">
          {questType === "sequential" ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={artifacts.map((artifact) => artifact.artefactId || artifact.id)}
                strategy={verticalListSortingStrategy}
              >
                {artifacts.map((artifact, index) => (
                  <SortableArtifact
                    key={artifact.artefactId || artifact.id}
                    artifact={artifact}
                    index={index}
                    questType={questType}
                    isActive={activeArtifactIndex === index}
                    artifactsLength={artifacts.length}
                    onRemoveArtifact={onRemoveArtifact}
                    onMoveArtifact={onMoveArtifact}
                    onToggleDetails={onToggleDetails}
                    artifactLookup={artifactLookup}
                  >
                    {activeArtifactIndex === index ? children : null}
                  </SortableArtifact>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            // For random/non-sequential mode, no need for drag and drop functionality
            artifacts.map((artifact, index) => {
              const artifactName = artifactLookup?.[artifact.artefactId]?.name || 
                                  artifact.name || 
                                  `Artifact ${index + 1}`;
              
              return (
                <div
                  key={artifact.artefactId || artifact.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex justify-between items-center p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-medium cursor-pointer"
                        onClick={() => onToggleDetails(index)}
                      >
                        {artifactName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {artifact.hints?.length || 0}{" "}
                        {(artifact.hints?.length || 0) === 1 ? "hint" : "hints"}
                      </span>
                      <button
                        onClick={() => onRemoveArtifact(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                      <button
                        onClick={() => onToggleDetails(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {activeArtifactIndex === index ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  {activeArtifactIndex === index && children}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            No artifacts added yet. Click &#39;Add Artifact&#39; to begin.
          </p>
        </div>
      )}
    </div>
  );
};