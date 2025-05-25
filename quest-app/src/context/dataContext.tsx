'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Artefact, Quest } from '@/lib/types';

type DataContextType = {
  artefacts: Artefact[];
  quests: Quest[];
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextType>({
  artefacts: [],
  quests: [],
  loading: true,
  error: null,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{
    artefacts: Artefact[];
    quests: Quest[];
  }>({ artefacts: [], quests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both data sources in parallel
        const [artefactsRes, questsRes] = await Promise.all([
          fetch('/api/get-artefacts'),
          fetch('/api/get-quests'),
        ]);

        if (!artefactsRes.ok || !questsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [artefactsData, questsData] = await Promise.all([
          artefactsRes.json(),
          questsRes.json(),
        ]);

        setData({
          artefacts: artefactsData.artifacts || [],
          quests: questsData.quests || [],
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        artefacts: data.artefacts,
        quests: data.quests,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}