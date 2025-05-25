"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { RestorationContent } from "@/lib/types";

interface RestorationProps {
  content: RestorationContent;
  onUpdate: (content: RestorationContent) => void;
}

interface RestorationStep {
  name: string;
  date: string;
  description: string;
  imageUrl: string;
  organization?: string;
}

export const RestorationComponent = ({ content, onUpdate }: RestorationProps) => {
  console.log('RestorationComponent rendered with content:', content);
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(!content.restorations?.length);
  const [numberOfRestorations, setNumberOfRestorations] = useState(1);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<RestorationStep[]>(content.restorations || []);
  const [currentStepData, setCurrentStepData] = useState<RestorationStep>({
    name: "",
    date: "",
    description: "",
    imageUrl: "",
    organization: "",
  });

  useEffect(() => {
    if (content.restorations?.length) {
      setSteps(content.restorations);
      setIsInitialModalOpen(false);
      setIsStepsModalOpen(false);
    }
  }, [content.restorations]);

  const handleInitialSubmit = () => {
    setIsInitialModalOpen(false);
    setIsStepsModalOpen(true);
    setSteps(new Array(numberOfRestorations).fill(null).map(() => ({
      name: "",
      date: "",
      description: "",
      imageUrl: "",
      organization: "",
    })));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentStepData({
          ...currentStepData,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStepSubmit = () => {
    const newSteps = [...steps];
    newSteps[currentStep] = { ...currentStepData };
    setSteps(newSteps);

    if (currentStep < numberOfRestorations - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentStepData({
        name: "",
        date: "",
        description: "",
        imageUrl: "",
        organization: "",
      });
    } else {
      setIsStepsModalOpen(false);
      const updatedContent = { 
        restorations: newSteps.map((step, index) => ({ 
          ...step, 
          id: `${index}` 
        }))
      };
      console.log('Final steps array:', newSteps);
      console.log('Updating restoration content:', updatedContent);
      onUpdate(updatedContent);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentStepData(steps[currentStep - 1]);
    }
  };

  if (isInitialModalOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Number of Restorations</h2>
          <input
            type="number"
            min="1"
            value={numberOfRestorations}
            onChange={(e) => setNumberOfRestorations(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={handleInitialSubmit}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (isStepsModalOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            {Array.from({ length: numberOfRestorations }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
                    ${index === currentStep ? "bg-blue-500 text-white" : 
                      index < currentStep ? "bg-green-500 text-white" : "bg-gray-200"}`}
                  onClick={() => {
                    if (index < currentStep) {
                      setCurrentStep(index);
                      setCurrentStepData(steps[index]);
                    }
                  }}
                >
                  {index + 1}
                </div>
                {index < numberOfRestorations - 1 && (
                  <div className="w-12 h-1 bg-gray-200">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${index < currentStep ? "100%" : "0%"}`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">Restoration {currentStep + 1}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Name of Restoration*</label>
              <input
                type="text"
                value={currentStepData.name}
                onChange={(e) => setCurrentStepData({ ...currentStepData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={currentStepData.date === "unknown" ? "" : currentStepData.date}
                  onChange={(e) => setCurrentStepData({ ...currentStepData, date: e.target.value })}
                  className="flex-1 p-2 border rounded"
                  disabled={currentStepData.date === "unknown"}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentStepData.date === "unknown"}
                    onChange={(e) => setCurrentStepData({
                      ...currentStepData,
                      date: e.target.checked ? "unknown" : ""
                    })}
                  />
                  Unknown
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">Description*</label>
              <textarea
                value={currentStepData.description}
                onChange={(e) => setCurrentStepData({ ...currentStepData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Image*</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
                required
              />
              {currentStepData.imageUrl && (
                <div className="mt-2 relative h-40 w-full">
                  <Image
                    src={currentStepData.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1">Organization (Optional)</label>
              <input
                type="text"
                value={currentStepData.organization}
                onChange={(e) => setCurrentStepData({ ...currentStepData, organization: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleStepBack}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button
              onClick={handleStepSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!currentStepData.name || !currentStepData.description || !currentStepData.imageUrl}
            >
              {currentStep === numberOfRestorations - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display the timeline
  return (
    <div className="space-y-6">
      {content.restorations?.length > 0 ? (
        content.restorations.map((restoration) => (
          <div key={restoration.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-bold">{restoration.name}</h3>
            <p className="text-sm text-gray-500">
              {restoration.organization && `${restoration.organization} - `}
              {restoration.date}
            </p>
            <p className="my-2">{restoration.description}</p>
            {restoration.imageUrl && (
              <div className="relative h-48 w-full mt-2">
                <Image
                  src={restoration.imageUrl}
                  alt={restoration.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">
          <p>No restoration history available.</p>
        </div>
      )}
    </div>
  );
};
