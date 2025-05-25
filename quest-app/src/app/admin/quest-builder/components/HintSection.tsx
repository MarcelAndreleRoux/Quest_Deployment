"use client";

import {
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  List,
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

type Hint = {
  description: string;
  displayAfterAttempts: number;
};

type HintsSectionProps = {
  hints: Hint[];
  hintDisplayMode: string;
  currentHint: Hint;
  onAddHint: () => void;
  onRemoveHint: (hintIndex: number) => void;
  onMoveHint: (hintIndex: number, direction: "up" | "down") => void;
  onCurrentHintChange: (value: string) => void;
  onReorderHints: (newOrder: Hint[]) => void;
};

type SortableHintProps = {
  hint: Hint;
  index: number;
  hintDisplayMode: string;
  onRemoveHint: (index: number) => void;
  onMoveHint: (index: number, direction: "up" | "down") => void;
  hints: Hint[];
};

// Sortable hint item component
const SortableHint = ({
  hint,
  index,
  hintDisplayMode,
  onRemoveHint,
  onMoveHint,
  hints,
}: SortableHintProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `hint-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 bg-gray-50 rounded ${
        isDragging ? "border border-indigo-400" : ""
      }`}
    >
      {hintDisplayMode === "sequential" && (
        <div className="flex items-center mr-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-indigo-600 mr-1"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex flex-col items-center">
            <button
              className={`text-gray-500 hover:text-indigo-600 ${
                index === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => onMoveHint(index, "up")}
              disabled={index === 0}
            >
              <ArrowUp size={14} />
            </button>
            <button
              className={`text-gray-500 hover:text-indigo-600 ${
                index === hints.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => onMoveHint(index, "down")}
              disabled={index === hints.length - 1}
            >
              <ArrowDown size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="text-xs font-medium text-gray-500 mr-2">
            {hintDisplayMode === "sequential" ? `Hint #${index + 1}:` : "Hint:"}
          </span>
          <p className="text-sm">{hint.description}</p>
        </div>
      </div>

      <button
        onClick={() => onRemoveHint(index)}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        <Trash size={16} />
      </button>
    </div>
  );
};

export const HintsSection = ({
  hints,
  hintDisplayMode,
  currentHint,
  onAddHint,
  onRemoveHint,
  onMoveHint,
  onCurrentHintChange,
  onReorderHints,
}: HintsSectionProps) => {
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
      const oldIndex = parseInt(active.id.toString().split("-")[1]);
      const newIndex = parseInt(over.id.toString().split("-")[1]);

      // Create a new array with the updated order
      const newHintsOrder = arrayMove(hints, oldIndex, newIndex);

      // Call the provided reorder function with the new array
      onReorderHints(newHintsOrder);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Hints (max 5)</h4>          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Display Mode:</span>
            <div className="flex items-center gap-1 px-3 py-1 rounded text-sm bg-indigo-600 text-white">
              <List size={14} />
              <span>Sequential</span>
            </div>
          </div>
        </div>

        {hintDisplayMode === "sequential" && (
          <p className="text-xs text-gray-500 mb-3">
            Hints will be displayed in the order shown below. Drag hints to
            reorder or use arrows.
          </p>
        )}

        {hintDisplayMode === "random" && (
          <p className="text-xs text-gray-500 mb-3">
            Hints will be displayed in random order.
          </p>
        )}
      </div>

      {hints.length > 0 ? (
        <div className="mb-4 space-y-2">
          {hintDisplayMode === "sequential" ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={hints.map((_, index) => `hint-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {hints.map((hint, hintIndex) => (
                  <SortableHint
                    key={`hint-${hintIndex}`}
                    hint={hint}
                    index={hintIndex}
                    hintDisplayMode={hintDisplayMode}
                    onRemoveHint={onRemoveHint}
                    onMoveHint={onMoveHint}
                    hints={hints}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            // For random mode, no need for drag and drop functionality
            hints.map((hint, hintIndex) => (
              <div
                key={hintIndex}
                className="flex items-center p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 mr-2">
                      Hint:
                    </span>
                    <p className="text-sm">{hint.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveHint(hintIndex)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No hints added yet.</p>
      )}

      {hints.length < 5 && (
        <div className="space-y-3">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Add a hint to help find this artifact..."
            value={currentHint.description}
            onChange={(e) => onCurrentHintChange(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
            onClick={onAddHint}
          >
            <Plus size={16} />
            Add Hint
          </button>
        </div>
      )}
    </div>
  );
};
