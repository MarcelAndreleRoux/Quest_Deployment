// components/ui/quests.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useData } from '@/context/dataContext';
import { useQuest } from '@/context/questContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarDays, Trophy, MapPin } from 'lucide-react';
import type { Quest, Hint } from '@/lib/types';

interface QuestProgress {
  collectedArtefactIds: string[];
  completed: boolean;
  completedAt?: string | null;
  attempts: number;
  startTime?: string;
  endTime?: string;
  lastAttemptedArtefactId?: string;
  displayedHints: Record<string, boolean>;
}

type MainQuest = Omit<Quest, 'artefacts'> & {
  artefacts: Array<{
    artefactId: string;
    hints: Hint[];
    hintDisplayMode: 'sequential' | 'random';
    name?: string;
  }>;
  dateRange?: {
    from?: string;
    to?: string;
  };
  questType?: 'sequential' | 'random';
  prize?: {
    title: string;
  };
};

function parseDate(date?: string | Date): Date | undefined {
  return date ? new Date(date) : undefined;
}

function isMainQuest(q: unknown): q is MainQuest {
  if (!q || typeof q !== 'object') return false;
  const quest = q as MainQuest;
  return typeof quest.title === 'string' && 
         typeof quest.quest_id === 'string' &&
         Array.isArray(quest.artefacts);
}

export default function Quests() {
  const { quests, loading, error } = useData();
  const { activeQuest, acceptQuest, cancelQuest } = useQuest();
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  
  // Get the single attempts number
  const getAttempts = useCallback((): number => {
    return progress?.attempts || 0;
  }, [progress]);

  const handleError = useCallback((err: unknown) => {
    console.error(err);
    setProgressError('Could not load progress');
    setProgressLoading(false);
  }, [setProgressError, setProgressLoading]);

  const loadQuestProgress = useCallback(async (questId: string) => {
    setProgressLoading(true);
    setProgressError(null);

    try {
      let token = localStorage.getItem('token');
      if (!token && typeof window !== 'undefined') {
        const oidcKey = Object.keys(sessionStorage).find(k => k.startsWith('oidc.user:'));
        if (oidcKey) {
          const oidcUser = JSON.parse(sessionStorage.getItem(oidcKey) || '{}');
          token = oidcUser.id_token;
        }
      }

      const response = await fetch(`/api/user-quest-progress?questId=${questId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quest progress');
      }

      const data = await response.json();
      setProgress(data);
    } catch (error) {
      handleError(error);
    } finally {
      setProgressLoading(false);
    }
  }, [handleError, setProgress, setProgressError, setProgressLoading]);

  useEffect(() => {
    if (isMainQuest(activeQuest)) {
      loadQuestProgress(activeQuest.quest_id);
    } else {
      setProgress(null);
    }
  }, [activeQuest, loadQuestProgress, setProgress]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Quests</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Quests</h1>
        <div className="text-red-500">Error loading quests: {error}</div>
      </div>
    );
  }

  if (!quests?.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Quests</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No quests available at this time</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  let questToShow: MainQuest | null = null;
  const ongoingQuests: MainQuest[] = [];
  const upcomingQuests: MainQuest[] = [];

  // Categorize quests
  for (const quest of quests) {
    if (isMainQuest(quest)) {
      const from = parseDate(quest.dateRange?.from);
      const to = parseDate(quest.dateRange?.to);
      const isAccepted = activeQuest?.quest_id === quest.quest_id;

      if (isAccepted) {
        questToShow = quest;
      } else if (from && from > now) {
        upcomingQuests.push(quest);
      } else if (from && from <= now && (!to || to > now)) {
        ongoingQuests.push(quest);
      }
    }
  }

  // Determine which artefacts to display based on quest type
  const getVisibleArtefacts = (questType: 'sequential' | 'random' | undefined, artefacts: MainQuest['artefacts'], progress: QuestProgress) => {
    if (questType === 'random' && !progress.completed) {
      const uncollectedArtefacts = artefacts.filter(
        a => !progress.collectedArtefactIds?.includes(a.artefactId)
      );
      if (uncollectedArtefacts.length > 0) {
        return [uncollectedArtefacts[Math.floor(Math.random() * uncollectedArtefacts.length)]];
      }
    }
    return artefacts;
  };  // Get hints to display for an artefact based on its hint display mode and attempts
  const getHintsToDisplay = (artefact: MainQuest['artefacts'][0], attempts: number, progress: QuestProgress): Hint[] => {
    if (attempts === 0 || !progress.startTime) {
      return [];
    }

    // Filter hints based on the number of attempts
    const eligibleHints = artefact.hints.filter(hint => {
      if (attempts < hint.displayAfterAttempts) {
        return false;
      }
      return true;
    });

    if (eligibleHints.length === 0) {
      return [];
    }

    if (artefact.hintDisplayMode === 'random') {
      // Get unshown hints for the current artefact
      const unshownHints = eligibleHints.filter((_, idx) => {
        const hintKey = `${artefact.artefactId}-${idx}`;
        return !progress.displayedHints[hintKey];
      });

      if (unshownHints.length === 0) {
        return [];
      }

      // Return a random unshown hint
      return [unshownHints[Math.floor(Math.random() * unshownHints.length)]];
    }

    // For sequential hints, return all eligible hints in order
    return eligibleHints;
  };

  return (
    <div className="pb-20 p-6 space-y-10">
      <h1 className="text-2xl font-bold">Quests</h1>

      {/* Accepted Quest Section */}
      {questToShow && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Accepted Quest</h2>
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>{questToShow.title}</CardTitle>
              <CardDescription>{questToShow.description}</CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4">
              {/* Quest Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {questToShow.dateRange && (
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Available Until</p>
                      <p className="text-muted-foreground">
                        {questToShow.dateRange.to ? new Date(questToShow.dateRange.to).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Artefacts</p>
                    <p className="text-muted-foreground">
                      {questToShow.artefacts.length} to discover
                    </p>
                  </div>
                </div>
                {questToShow.prize && (
                  <div className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Prize</p>
                      <p className="text-muted-foreground">{questToShow.prize.title}</p>
                    </div>
                  </div>
                )}
              </div>              {/* Hints Section */}
              {questToShow && progress && (
                <div className="mt-4">
                  <h3 className="font-medium text-blue-800 mb-3">Quest Progress & Hints</h3>
                  <div className="space-y-3">
                    {getVisibleArtefacts(questToShow.questType, questToShow.artefacts, progress).map((artefact) => {
                      const originalIndex = questToShow.artefacts.findIndex(a => a.artefactId === artefact.artefactId);
                      const isCollected = progress.collectedArtefactIds?.includes(artefact.artefactId);
                      const isNextInSequence = !progress.completed && 
                        questToShow.questType === 'sequential' && 
                        originalIndex === (progress.collectedArtefactIds?.length || 0);
                      const attempts = getAttempts();
                      const isLastAttempted = progress.lastAttemptedArtefactId === artefact.artefactId;

                      if (questToShow.questType === 'sequential' && !isCollected && !isNextInSequence) {
                        return null;
                      }

                      const hintsToDisplay = getHintsToDisplay(artefact, attempts, progress);

                      return (
                        <div 
                          key={artefact.artefactId}
                          className={`rounded-lg border p-4 ${
                            isCollected 
                              ? 'bg-green-50 border-green-200' 
                              : isNextInSequence
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{artefact.name}</span>
                              {isCollected && (
                                <span className="ml-2 text-green-600 text-sm">✓ Found</span>
                              )}
                              {isNextInSequence && !progress.completed && (
                                <span className="ml-2 text-blue-600 text-sm">Current Target</span>
                              )}
                            </div>
                            {(attempts > 0 && isLastAttempted && !isCollected) && (
                              <span className="text-sm text-gray-500">
                                Attempts: {attempts}
                              </span>
                            )}
                          </div>                          {/* Show hints section */}
                          {!isCollected && !progress.completed && artefact.hints && (
                            <div className="space-y-2 mt-3">
                              {hintsToDisplay.map((hint, idx) => {
                                const hintKey = `${artefact.artefactId}-${idx}`;
                                const isDisplayed = progress.displayedHints[hintKey];
                                
                                if (!isDisplayed) {
                                  // Update displayedHints in the backend
                                  fetch(`/api/user-quest-progress`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      questId: questToShow.quest_id,
                                      artefactId: artefact.artefactId,
                                      displayedHint: { [hintKey]: true }
                                    })
                                  }).catch(console.error);

                                  // Update local progress state
                                  setProgress(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      displayedHints: {
                                        ...prev.displayedHints,
                                        [hintKey]: true
                                      }
                                    };
                                  });
                                }
                                
                                return (
                                  <div 
                                    key={idx}
                                    className="text-sm bg-white p-3 rounded border border-gray-200"
                                  >
                                    <div className="flex gap-2 items-center">
                                      <span className="font-medium">Hint {idx + 1}</span>
                                    </div>
                                    <p className="mt-1 text-gray-600">{hint.description}</p>
                                  </div>
                                );
                              })}
                              {artefact.hints.some(hint => attempts < hint.displayAfterAttempts) && (
                                <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                  <div className="flex gap-2 items-center">
                                    <span className="font-medium text-gray-400">Next Hint</span>
                                    <span className="text-gray-400 text-xs">
                                      (Unlocks after more attempts)
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 items-stretch">
              {/* Progress display */}
              {progressLoading ? (
                <div className="text-blue-500">Loading progress...</div>
              ) : progressError ? (
                <div className="text-red-500">{progressError}</div>
              ) : progress ? (
                <div className="w-full flex items-center gap-2">
                  {progress.completed ? (
                    <span className="text-green-600 font-semibold">Quest Completed! 🎉</span>
                  ) : (
                    <>
                      <span className="font-medium">Artefacts found:</span>
                      <span>
                        {progress.collectedArtefactIds.length} / {questToShow.artefacts.length}
                      </span>
                    </>
                  )}
                </div>
              ) : null}

              <Button 
                onClick={cancelQuest}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Cancel Quest
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Ongoing Quests Section */}
      {ongoingQuests.length > 0 && !questToShow && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-green-700">Ongoing Quests</h2>
          <div className="grid gap-6">
            {ongoingQuests.map((quest) => (
              <Card key={quest.quest_id}>
                <CardHeader>
                  <CardTitle>{quest.title}</CardTitle>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {quest.dateRange && (
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Available Until</p>
                        <p className="text-muted-foreground">
                          {quest.dateRange.to ? new Date(quest.dateRange.to).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Artefacts</p>
                      <p className="text-muted-foreground">{quest.artefacts.length} to discover</p>
                    </div>
                  </div>
                  {quest.prize && (
                    <div className="flex items-start gap-3">
                      <Trophy className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Prize</p>
                        <p className="text-muted-foreground">{quest.prize.title}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => acceptQuest(quest)}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    Accept Quest
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Quests Section */}
      {upcomingQuests.length > 0 && !questToShow && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Upcoming Quests</h2>
          <div className="grid gap-6">
            {upcomingQuests.map((quest) => (
              <Card key={quest.quest_id}>
                <CardHeader>
                  <CardTitle>{quest.title}</CardTitle>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {quest.dateRange && (
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Available From</p>
                        <p className="text-muted-foreground">
                          {quest.dateRange.from ? new Date(quest.dateRange.from).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Artefacts</p>
                      <p className="text-muted-foreground">{quest.artefacts.length} to discover</p>
                    </div>
                  </div>
                  {quest.prize && (
                    <div className="flex items-start gap-3">
                      <Trophy className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Prize</p>
                        <p className="text-muted-foreground">{quest.prize.title}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    disabled 
                    variant="secondary" 
                    className="w-full sm:w-auto opacity-60 cursor-not-allowed"
                  >
                    Not Yet Available
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}