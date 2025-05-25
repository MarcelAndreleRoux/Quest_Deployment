"use client";

import { useData } from "@/context/dataContext";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash } from "lucide-react";
import SuccessPopup from "@/components/ui/SuccessPopup";

export default function AdminHome() {
  const { artefacts, quests, loading } = useData();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"artefact" | "quest" | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[90vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
          <div className="flex flex-col w-full gap-8">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mb-6">
                Manage your quests and artefacts here.
              </p>
            </div>

            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const handleDeleteArtefact = async (id: string) => {
    // Check if artefact is used in any quest
    const res = await fetch("/api/check-artifact-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artefactId: id }),
    });
    const data = await res.json();
    if (data.usedIn && data.usedIn.length > 0) {
      setDeleteWarning(
        `This artefact is used in the following quest(s):\n${data.usedIn
          .map((q: { title: string }) => q.title)
          .join(", ")}. You must remove it from all quests before deleting.`
      );
      setDeletingId(id);
      setDeleteType("artefact");
      return;
    }
    setDeleteWarning("");
    setDeletingId(id);
    setDeleteType("artefact");
  };

  const handleDeleteQuest = (id: string) => {
    setDeletingId(id);
    setDeleteType("quest");
    setDeleteWarning("");
  };

  const confirmDelete = async () => {
    if (!deletingId || !deleteType) return;
    const url = deleteType === "artefact" ? "/api/delete-artifact" : "/api/delete-quest";
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deletingId }),
    });
    if (res.ok) {
      setShowDeleteSuccess(true);
      setTimeout(() => window.location.reload(), 1200);
    }
    setDeletingId(null);
    setDeleteType(null);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[90vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="flex flex-col w-full gap-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mb-6">
              Manage your quests and artefacts here.
            </p>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-4">Quests</h2>
              <Button
                variant="default"
                onClick={() => router.push("/admin/quest-builder")}
              >
                Create New Quest
              </Button>
            </div>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div className="relative flex items-center w-full" key={quest.quest_id}>
                  <Button
                    variant="outline"
                    className="flex-1 justify-between px-4 py-6 text-left hover:border-indigo-500 group pr-10"
                    onClick={() => router.push(`/admin/quest-builder?edit=${quest.quest_id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-base group-hover:text-indigo-600">
                        {quest.title}
                      </h3>
                    </div>
                    <Edit className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 ml-auto" />
                  </Button>
                  <button
                    className="ml-4 text-red-400 hover:text-white hover:bg-red-400 hover:cursor-pointer z-20 bg-white rounded-sm p-1 shadow transition-colors duration-200 ease-in-out"
                    title="Delete quest"
                    onClick={() => handleDeleteQuest(quest.quest_id)}
                  >
                    <Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-4">Artefacts</h2>
              <Button
                variant="default"
                onClick={() => router.push("/admin/page-builder")}
              >
                Create New artefact
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {artefacts.map((artefact) => (
                <div className="relative flex items-center w-full" key={artefact.id}>
                  <Button
                    variant="outline"
                    className="flex-1 justify-between px-4 py-6 text-left hover:border-indigo-500 group pr-10"
                    onClick={() => router.push(`/admin/page-builder?edit=${artefact.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-base group-hover:text-indigo-600">
                        {artefact.name}
                      </h3>
                    </div>
                    <Edit className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 ml-auto" />
                  </Button>
                  <button
                    className="ml-4 text-red-400 hover:text-white hover:bg-red-400 hover:cursor-pointer z-20 rounded-sm bg-white p-1 shadow transition-colors duration-200 ease-in-out"
                    title="Delete quest"
                    onClick={() => handleDeleteArtefact(artefact.id)}
                  >
                    <Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center animate-fade-in">
            <div className="mb-4">
              <Trash className="w-12 h-12 text-red-500 animate-bounce" />
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-6 text-center">
              {deleteWarning
                ? deleteWarning
                : `Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setDeleteType(null);
                  setDeleteWarning("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
              >
                Cancel
              </button>
              {!deleteWarning && (
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showDeleteSuccess && (
        <SuccessPopup message="Deleted successfully!" onOk={() => window.location.reload()} />
      )}
    </div>
  );
}
