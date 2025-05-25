'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { Quest } from '@/lib/types';

type QuestContextType = {
  activeQuest: Quest | null;
  isLoading: boolean;
  acceptQuest: (quest: Quest) => void;
  cancelQuest: () => void;
  submitArtefact: (artefactId: string) => boolean;
};

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore active quest from sessionStorage on mount
  useEffect(() => {
    const storedQuest = sessionStorage.getItem('activeQuest');
    if (storedQuest) {
      try {
        setActiveQuest(JSON.parse(storedQuest));
      } catch (err) {
        console.error('Error parsing stored quest:', err);
        sessionStorage.removeItem('activeQuest');
      }
    }
    setIsLoading(false);
  }, []);

  // Save active quest to sessionStorage whenever it changes
  useEffect(() => {
    if (activeQuest) {
      sessionStorage.setItem('activeQuest', JSON.stringify(activeQuest));
    } else {
      sessionStorage.removeItem('activeQuest');
    }
  }, [activeQuest]);

  const acceptQuest = async (quest: Quest) => {
    if (activeQuest) {
      console.warn('A quest is already active. Cancel it before accepting a new one.');
      return;
    }
    // Get JWT token from localStorage or sessionStorage (OIDC user)
    let token = localStorage.getItem('token');
    if (!token && typeof window !== 'undefined') {
      const oidcKey = Object.keys(sessionStorage).find((k) => k.startsWith('oidc.user:'));
      if (oidcKey) {
        try {
          const oidcUser = JSON.parse(sessionStorage.getItem(oidcKey) || '{}');
          token = oidcUser.id_token;
        } catch {
          console.error('Error parsing OIDC user from sessionStorage');
          sessionStorage.removeItem(oidcKey); // Clean up if parsing fails
        }
      }
    }
    try {
      const res = await fetch('/api/start-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ questId: quest.quest_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveQuest(quest);
      } else if (res.status === 409) {
        // Quest already started for this user
        setActiveQuest(quest);
      } else {
        console.error('Failed to start quest:', data.error || res.statusText);
        alert('Failed to accept quest: ' + (data.error || res.statusText));
      }
    } catch (err) {
      console.error('Error starting quest:', err);
      alert('Error accepting quest. Please try again.');
    }
  };

  const cancelQuest = async () => {
    let token = localStorage.getItem('token');
    if (!token && typeof window !== 'undefined') {
      const oidcKey = Object.keys(sessionStorage).find(k => k.startsWith('oidc.user:'));
      if (oidcKey) {
        try {
          const oidcUser = JSON.parse(sessionStorage.getItem(oidcKey) || '{}');
          token = oidcUser.id_token;
        } catch {
          console.error('Error parsing OIDC user from sessionStorage');
          sessionStorage.removeItem(oidcKey); // Clean up if parsing fails
        }
      }
    }

    if (activeQuest) {
      try {
        // Optional: Notify backend that user cancelled quest
        await fetch(`/api/user-quest-progress?questId=${activeQuest.quest_id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
      } catch (err) {
        console.error('Error cancelling quest:', err);
      }
    }
    setActiveQuest(null);
  };

  const submitArtefact = (artefactId: string): boolean => {
    if (!activeQuest) return false;
    return activeQuest.artefacts.some((artefact) => artefact.artefactId === artefactId);
  };

  return (
    <QuestContext.Provider value={{ activeQuest, isLoading, acceptQuest, cancelQuest, submitArtefact }}>
      {children}
    </QuestContext.Provider>
  );
};

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) throw new Error('useQuest must be used within a QuestProvider');
  return context;
};