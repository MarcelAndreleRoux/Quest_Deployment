// components/ui/artefactDetails.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Info, Calendar, MapPin, Ruler, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeGenerator from '@/components/QRGenerator';
import { ComponentData } from '@/lib/types';
import { useQuest } from '@/context/questContext';

interface ArtefactDetailProps {
  artefactId: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface QuestProgress {
  collectedArtefactIds: string[];
  completed: boolean;
  completedAt?: string | null;
  attempts: number;
  lastAttemptedArtefactId?: string;
}


// Separate component for image with points to avoid hook issues
function ImageWithPoints({ component }: { component: ComponentData }) {
  const [showPoints, setShowPoints] = useState(true);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  
  const imageContent = component.content as any;

  const handleNextPoint = () => {
    if (!imageContent.points?.length) return;
    if (activePoint === null) {
      setActivePoint(0);
    } else {
      setActivePoint((activePoint + 1) % imageContent.points.length);
    }
  };

  const handlePrevPoint = () => {
    if (!imageContent.points?.length) return;
    if (activePoint === null) {
      setActivePoint(imageContent.points.length - 1);
    } else {
      setActivePoint(activePoint === 0 ? imageContent.points.length - 1 : activePoint - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Help text */}
      {imageContent.points?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            💡 This image contains {imageContent.points.length} point{imageContent.points.length !== 1 ? 's' : ''} of interest. 
            Click on the numbered points or use the controls below to explore them.
          </p>
        </div>
      )}
      
      <div className="w-full relative">
        <div className="relative w-full aspect-[4/3] sm:aspect-video max-w-[95vw] mx-auto">
          <Image
            src={imageContent.url}
            alt="Artifact Image"
            fill
            className="rounded-lg object-contain"
            sizes="(max-width: 640px) 95vw, 100vw"
          />
          {showPoints && imageContent.points?.map((point: any, index: number) => (
            <div
              key={point.id}
              className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ 
                left: `${point.x}%`,
                top: `${point.y}%`,
                opacity: activePoint === null || activePoint === index ? 1 : 0.3
              }}
            >
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-colors ${
                  activePoint === index ? 'bg-blue-500 ring-2 ring-white' : 'bg-red-500/50'
                }`}
                onClick={() => setActivePoint(index)}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>


      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <button
          onClick={() => setShowPoints(!showPoints)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showPoints 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          {showPoints ? 'Hide Points' : 'Show Points'}
        </button>
        
        {imageContent.points?.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPoint}
              className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
            >
              ←
            </button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {activePoint !== null ? `Point ${activePoint + 1}` : 'Select Point'}
            </span>
            <button
              onClick={handleNextPoint}
              className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
      
      {/* Points list */}
      {imageContent.points?.length > 0 && (
        <div className="space-y-3 mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold flex items-center justify-between">
            <span>Points of Interest</span>
            {activePoint !== null && (
              <span className="text-sm text-gray-500">
                Point {activePoint + 1} of {imageContent.points.length}
              </span>
            )}
          </h4>
          <div className="space-y-2">
            {activePoint !== null ? (
              <div className="flex gap-2 items-start p-3 bg-white rounded-lg shadow-sm">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                  {activePoint + 1}
                </div>
                <p className="text-sm text-gray-700">{imageContent.points[activePoint].text}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Select a point to view its description
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for restoration timeline
function RestorationTimeline({ component }: { component: ComponentData }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const restorationContent = component.content as any;
  const restorations = restorationContent.restorations || [];

  const handleNext = () => {
    if (restorations.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % restorations.length);
  };

  const handlePrev = () => {
    if (restorations.length === 0) return;
    setActiveIndex((prev) => prev === 0 ? restorations.length - 1 : prev - 1);
  };

  const handleTimelineClick = (index: number) => {
    setActiveIndex(index);
  };

  if (!restorations.length) {
    return (
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-2">Restoration Timeline</h4>
        <p className="text-muted-foreground">No restoration data available</p>
      </div>
    );
  }

  const currentRestoration = restorations[activeIndex];

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <h4 className="font-semibold text-xl">Restoration Timeline</h4>
      
      {/* Timeline visualization */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
          
          {/* Timeline points */}
          {restorations.map((_: any, index: number) => (
            <div key={index} className="relative flex flex-col items-center">
              <button
                onClick={() => handleTimelineClick(index)}
                className={`w-4 h-4 rounded-full border-2 bg-white transition-all duration-200 hover:scale-110 ${
                  index === activeIndex 
                    ? 'border-blue-500 bg-blue-500' 
                    : index < activeIndex 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                }`}
              />
              <span className="text-xs text-gray-500 mt-2 max-w-16 text-center">
                {restorations[index].date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <button
          onClick={handlePrev}
          disabled={restorations.length <= 1}
          className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>
        
        <div className="text-center">
          <span className="text-sm font-medium">
            Step {activeIndex + 1} of {restorations.length}
          </span>
        </div>
        
        <button
          onClick={handleNext}
          disabled={restorations.length <= 1}
          className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>

      {/* Current restoration details */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-semibold text-lg text-blue-600">
              {currentRestoration.name}
            </h5>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {currentRestoration.date}
            </p>
          </div>
          {currentRestoration.organization && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {currentRestoration.organization}
            </div>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed">
          {currentRestoration.description}
        </p>

        {currentRestoration.imageUrl && (
          <div className="relative w-full max-w-full rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
            <Image
              src={currentRestoration.imageUrl}
              alt={currentRestoration.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {restorations.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => handleTimelineClick(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ArtefactDetail({ 
  artefactId,
  isOpen,
  onClose,
  onVisibilityChange 
}: ArtefactDetailProps) {
  interface Artefact {
    id: string;
    name: string;
    description: string;
    image?: string;
    createdAt?: string;
    components?: ComponentData[];
    // Add other fields as needed based on your artefact structure
  }
  
  const [artefact, setArtefact] = useState<Artefact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'success'|'error'|'already'|null>(null);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  
  const { activeQuest } = useQuest();

  // Fetch artefact from API
  useEffect(() => {
    if (!artefactId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/get-artefacts`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.artifacts.find((a: Artefact) => a.id === artefactId);
          setArtefact(found || null);
        } else {
          setError('Failed to fetch artefact');
        }
      })
      .catch(() => setError('Failed to fetch artefact'))
      .finally(() => setLoading(false));
  }, [artefactId]);

  // Fetch user quest progress for the active quest
  useEffect(() => {
    if (!activeQuest?.quest_id) return;

    // Get JWT token from localStorage or sessionStorage (OIDC user)
    let token = localStorage.getItem('token');
    if (!token && typeof window !== 'undefined') {
      const oidcKey = Object.keys(sessionStorage).find(k => k.startsWith('oidc.user:'));
      if (oidcKey) {
        try {
          const oidcUser = JSON.parse(sessionStorage.getItem(oidcKey) || '{}');
          token = oidcUser.id_token;
        } catch {
          console.warn('Failed to parse OIDC user from sessionStorage');
          token = null;
        }
      }
    }

    fetch(`/api/user-quest-progress?questId=${activeQuest.quest_id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          const progressData: QuestProgress = {
            collectedArtefactIds: data.collectedArtefactIds || [],
            completed: data.completed || false,
            completedAt: data.completedAt,
            attempts: data.attempts || 0,
            lastAttemptedArtefactId: data.lastAttemptedArtefactId
          };
          setProgress(progressData);
        } else {
          console.warn('User quest progress error:', data.error);
          setProgress(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch quest progress:', err);
        setProgress(null);
      });
  }, [activeQuest]);

  useEffect(() => {
    onVisibilityChange?.(isOpen);
  }, [isOpen, onVisibilityChange]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.querySelector('.navbar')?.classList.add('hidden');
    } else {
      document.body.style.overflow = '';
      document.querySelector('.navbar')?.classList.remove('hidden');
    }
    return () => {
      document.body.style.overflow = '';
      document.querySelector('.navbar')?.classList.remove('hidden');
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // Check if this is a sequential quest and if this is the next artefact
  const questArtefacts = Array.isArray(activeQuest?.artefacts) ? activeQuest.artefacts : [];
  const hintDisplayMode = questArtefacts[0]?.hintDisplayMode || 'concurrent';
  const isSequential = hintDisplayMode === 'sequential';
  
  let isNextSequential = false;
  if (isSequential && Array.isArray(questArtefacts) && progress) {
    const foundIds = Array.isArray(progress.collectedArtefactIds) ? progress.collectedArtefactIds : [];
    const nextArtefact = questArtefacts.find((a: { artefactId?: string } | string) => {
      const artefactId = typeof a === 'object' && a !== null ? a.artefactId ?? '' : a ?? '';
      return !foundIds.includes(artefactId);
    });
    const nextArtefactId = typeof nextArtefact === 'object' && nextArtefact !== null ? nextArtefact.artefactId ?? '' : nextArtefact ?? '';
    isNextSequential = !!(nextArtefactId && nextArtefactId === artefact?.id);
  }
  // Submit artefact as quest answer
  const handleSubmit = async () => {
    if (!activeQuest || !artefact?.id) return;
    setSubmitStatus(null);
    
    try {
      // Get JWT token from localStorage or sessionStorage (OIDC user)
      let token = localStorage.getItem('token');
      if (!token && typeof window !== 'undefined') {
        const oidcKey = Object.keys(sessionStorage).find(k => k.startsWith('oidc.user:'));
        if (oidcKey) {
          try {
            const oidcUser = JSON.parse(sessionStorage.getItem(oidcKey) || '{}');
            token = oidcUser.id_token;
          } catch {
            console.warn('Failed to parse OIDC user from sessionStorage');
            token = null;
          }
        }
      }
      
      const res = await fetch('/api/collect-artifact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ questId: activeQuest.quest_id, artefactId: artefact.id })
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (data.alreadyCollected) {
          setSubmitStatus('already');
        } else {
          setSubmitStatus('success');
        }
        const newProgress: QuestProgress = {
          collectedArtefactIds: data.collectedArtefactIds || [],
          completed: data.completed || false,
          completedAt: data.completedAt,
          attempts: data.attempts || 0,
          lastAttemptedArtefactId: data.lastAttemptedArtefactId
        };
        setProgress(newProgress);
      } else if (!data.success && data.error) {
        // Handle incorrect answers (both wrong artefact and wrong sequence)
        setSubmitStatus('error');
        
        // Update attempts counter from the response
        if (data.attempts !== undefined && data.progress) {
          const updatedProgress: QuestProgress = {
            collectedArtefactIds: data.progress.collectedArtefactIds || progress?.collectedArtefactIds || [],
            completed: data.progress.completed || false,
            completedAt: data.progress.completedAt,
            attempts: data.attempts,
            lastAttemptedArtefactId: data.lastAttemptedArtefactId
          };
          setProgress(updatedProgress);
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
    }
  };

  if (!isOpen) return null;
  if (loading) return <div className="p-8 text-center">Loading artefact...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return artefact ? (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="container max-w-6xl p-4 sm:px-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleClose}
            variant={"default"}
            size={"icon"}
          >
            <ArrowLeft size={24} />
          </Button>
        </div>

        <div className="space-y-8">
          {/* Hero image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={typeof artefact.image === 'string' && artefact.image ? artefact.image : `/api/placeholder/${artefact.id}`}
              alt={artefact.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Description and Components */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {artefact.name}
                </h1>
                <div className="flex items-center text-muted-foreground mb-6">
                  <span>ID: {artefact.id}</span>
                </div>
                <div className="prose max-w-none">
                  <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                    <Info size={18} /> About
                  </h2>
                  <p className="text-lg">{artefact.description}</p>
                </div>
              </div>

              {/* Render components in order */}
              {(artefact.components?.length ?? 0) > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Page Content</h2>
                  <div className="space-y-4">
                    {artefact.components?.map((component: ComponentData) => {
                      switch (component.type) {
                        case 'heading':
                          return <h3 key={component.id} className="text-2xl font-bold">{typeof component.content === 'string' ? component.content : ''}</h3>;
                        case 'paragraph':
                          return <p key={component.id} className="text-base">{typeof component.content === 'string' ? component.content : ''}</p>;
                        case 'image':
                          return <ImageWithPoints key={component.id} component={component} />;
                        case 'restoration':
                          return <RestorationTimeline key={component.id} component={component} />;
                        case 'details': {
                           const details = component.content as any;
                          return (
                            <div key={component.id} className="border rounded-xl p-6">
                              <h2 className="text-xl font-semibold mb-4">Details</h2>
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                                    <p className="text-sm">{details.created || 'Not specified'}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Origin</h3>
                                    <p className="text-sm">{details.origin || 'Not specified'}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Ruler className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Dimensions</h3>
                                    <p className="text-sm">{details.dimensions || 'Not specified'}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Box className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Materials</h3>
                                    <p className="text-sm">{details.materials || 'Not specified'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Details */}
            <div className="space-y-8">
              {/* QR Code */}
              <div className="bg-muted p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Artefact QR Code
                </h2>
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    data={{ artefactId: artefact.id }} 
                    size={200}
                    includeDownload={true}
                  />
                </div>
              </div>

              {/* Quest status */}
              {activeQuest && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-2">
                  <h3 className="font-medium text-blue-800 mb-1">Quest Artefact</h3>
                  <p className="text-sm text-blue-700">
                    This artefact is part of your active quest. Submit it to mark as found!
                  </p>
                  <Button onClick={handleSubmit} variant="default">
                    Submit as Quest Answer
                  </Button>
                  {isSequential && !isNextSequential && submitStatus === 'error' && (
                    <span className="text-yellow-600 font-medium">Incorrect artefact for this step. Try another.</span>
                  )}
                  {submitStatus === 'success' && <span className="text-green-600 font-medium">Artefact submitted!</span>}
                  {submitStatus === 'already' && <span className="text-blue-600 font-medium">Already submitted.</span>}
                  {submitStatus === 'error' && !isSequential && <span className="text-red-600 font-medium">Error submitting. Try again.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Gallery section */}
          <div className="pt-8">
            <h2 className="text-xl font-semibold mb-6">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {artefact.components?.filter((c: ComponentData) => c.type === 'image').map((c: ComponentData, i: number) => (
                <div key={c.id || i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={(c.content as { url: string }).url}
                    alt={artefact.name + ' - Image'}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Artefact not found</p>
    </div>
  );
}