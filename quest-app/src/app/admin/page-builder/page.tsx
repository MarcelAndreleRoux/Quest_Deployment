// app/admin/page-builder/page.tsx
"use client";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { ComponentList } from "./componentList";
import { DropZone } from "./dropZone";
import { ComponentData, RestorationContent } from "@/lib/types";
import { arrayMove } from "@dnd-kit/sortable";
import AuthGuard from "@/components/authGuard";
import { ImageContent } from "@/lib/types";
import { ImageEditor } from "./components/imageEditor";
import { ArtifactDetails } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import SuccessPopup from "@/components/ui/SuccessPopup";


const PageBuilder = () => {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [artifactName, setArtifactName] = useState("");
  const [artist, setArtist] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);
  const [editingImage, setEditingImage] = useState<ComponentData | null>(null);
  const [step, setStep] = useState(0);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Load artifact for editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const res = await fetch(`/api/get-artefacts`);
      const data = await res.json();
      if (data.success) {
        const found = data.artifacts.find((a: { id: string }) => a.id === editId);
        if (found) {
          setArtifactName(found.name || "");
          setArtist(found.artist || "");
          setDate(found.date || "");
          setDescription(found.description || "");
          setImage(found.image || "");
          setImagePreview(typeof found.image === "string" ? found.image : "");
          setComponents(found.components || []);
          setCreatedAt(found.createdAt || "");
        }
      }
    })();
  }, [editId]);

  const handleSubmit = async () => {
    if (!artifactName) {
      setShowError(true);
      return;
    }

    // Add order property to each component before saving
    const componentsWithOrder = components.map((component, index) => ({
      ...component,
      order: index
    }));

    // If the image is a File, convert to base64 string for backend upload
    let imageToSend = image;
    if (image && typeof image !== "string") {
      imageToSend = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image as File);
      });
    }

    const artifactData = {
      id: editId || crypto.randomUUID(), // Use existing ID if editing
      name: artifactName,
      artist,
      date,
      description,
      image: imageToSend,
      components: componentsWithOrder,
      createdAt: editId ? createdAt : new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      const response = await fetch("/api/save-artifact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(artifactData),
      });

      if (!response.ok) {
        let errorMsg = "Save failed";
        try {
          const errorData = await response.json() as { error?: string };
          errorMsg = errorData?.error || errorMsg;
        } catch {
          try {
            errorMsg = await response.text();
          } catch {
            // Keep default error message if text extraction fails
          }
        }
        throw new Error(errorMsg);
      }

      setComponents([]);
      setArtifactName("");
      setShowSuccess(true);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error saving artifact:", error);
      alert("Error saving artifact: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Existing drag end handler remains the same
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setComponents((items) => arrayMove(items, oldIndex, newIndex));
        return;
      }
    }    
      if (over?.id === "dropzone" && active.data.current?.isNew) {
      const type = active.data.current?.type as ComponentData['type'];
      const newComponent: ComponentData = {
        id: crypto.randomUUID(),
        type,
        order: components.length, 
        content: (() => {
          switch (type) {
            case "image":
              return { url: "", points: [] };
            case "restoration":
              return { restorations: [] };
            case "details":
              return {
                created: "",
                origin: "",
                currentLocation: "",
                dimensions: "",
                materials: ""
              };            case "heading":
              return "";
            case "paragraph":
              return "";
            default:
              return "";
          }
        })(),
      };
      
      setComponents(items => [...items, newComponent]);
    }
  };

  const handleDelete = (id: string) => {
    setComponents((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // Re-assign order after deletion to maintain sequential order
      return filtered.map((component, index) => ({
        ...component,
        order: index
      }));
    });
  };

  const handleUpdate = (id: string, content: string | ImageContent | RestorationContent | ArtifactDetails) => {
    console.log('Updating component:', id, content);
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (c.type === "image" && typeof content !== "string" && 'url' in content) {
          return { ...c, content } as ComponentData;
        } else if (
          (c.type === "heading" || c.type === "paragraph") &&
          typeof content === "string"
        ) {
          return { ...c, content } as ComponentData;
        } else if (c.type === "restoration" && typeof content !== "string" && 'restorations' in content) {
          console.log('Updating restoration component with:', content);
          return { ...c, content } as ComponentData;
        } else if (c.type === "details" && typeof content !== "string" && 'created' in content) {
          console.log('Updating details component with:', content);
          return { ...c, content } as ComponentData;
        }

        return c;
      })
    );
  };
  return (
    <AuthGuard adminOnly={true}>
      {showSuccess && (
        <SuccessPopup
          message="Artifact saved successfully!"
          onOk={() => (window.location.href = "/admin")}
        />
      )}

      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <ImageEditor
            imageUrl={(editingImage.content as ImageContent).url}
            points={(editingImage.content as ImageContent).points}
            onSave={(points) => {
              handleUpdate(editingImage.id, {
                ...(editingImage.content as ImageContent),
                points,
              });
              setEditingImage(null);
            }}
            onClose={() => setEditingImage(null)}
          />
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-screen bg-gray-50">
          <div className="p-4 border-b bg-white">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-2xl font-bold">Create New Artifact</h1>
              <p className="text-red-500 text-sm" hidden={!showError}>
                * Please enter a name for your artifact.
              </p>

              {/* Step 0: Basic Info */}
              {step === 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                  <h3 className="text-lg mb-2">Title of the artifact</h3>
                  <input
                    type="text"
                    required
                    placeholder="Artifact Name *"
                    value={artifactName}
                    onChange={(e) => setArtifactName(e.target.value)}
                    onFocus={() => setShowError(false)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <h3 className="text-lg mb-2">Enter the artist and date of the artifact (optional)</h3>
                  <input
                    type="text"
                    placeholder="Artist (optional)"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Date (optional)"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!artifactName) {
                        setShowError(true);
                        return;
                      }
                      setStep(1);
                    }}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                  >
                    Next
                  </button>
                </>
              )}

              {/* Step 1: Description & Image */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Description & Image</h2>
                  <h3 className="text-lg mb-2">Short artifact description to entise students to explore the page.</h3>
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                  <h3 className="text-lg mb-2">Upload an for your artifact. This will be the image displayed at the top of the artifact page.</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        setImage("");
                        setImagePreview("");
                      }
                    }}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (                    <div className="relative w-full h-48">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded border"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(0)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Page Builder */}
              {step === 2 && (
                <>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {isSaving ? "Saving..." : "Save Artifact"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Only show the page builder UI on step 2 */}
          {step === 2 && (
            <div className="flex flex-1 overflow-hidden">
              <ComponentList />
              <div className="flex-1 h-full min-h-full flex flex-col overflow-y-auto">
                <DropZone
                  components={components}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onEditPoints={setEditingImage}
                />
              </div>
            </div>
          )}
        </div>
      </DndContext>
    </AuthGuard>
  );
};

export default PageBuilder;