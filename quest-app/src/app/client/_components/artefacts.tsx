// components/ui/artefacts.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useData } from '@/context/dataContext';
import ArtefactCarousel from '@/components/ui/artefactCarousel';
import SearchBar from '@/components/ui/searchBar';
import ArtefactDetail from '@/components/ui/artefactDetails';
import type { Artefact } from '@/lib/types';
import ArtefactGrid from '@/components/ui/artefactGrid';

export default function Artefacts({ setSwipeEnabled }: { setSwipeEnabled: (enabled: boolean) => void }) {
  const { artefacts, loading, error } = useData();
  const [isGrid, setIsGrid] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('artefactsViewIsGrid');
      return savedState === 'true';
    }
    return false;
  });
  
  const [filteredArtefacts, setFilteredArtefacts] = useState<Artefact[]>(artefacts);
  const [selectedArtefact, setSelectedArtefact] = useState<Artefact | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPosition, setDetailPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Update filtered artefacts when the main artefacts data changes
  useEffect(() => {
    setFilteredArtefacts(artefacts);
  }, [artefacts]);

  // Save to localStorage whenever isGrid changes
  useEffect(() => {
    localStorage.setItem('artefactsViewIsGrid', String(isGrid));
  }, [isGrid]);

  const handleSearch = (results: Artefact[]) => {
    setFilteredArtefacts(results);
  };

  const handleArtefactSelect = (artefact: Artefact, elementRect: DOMRect) => {
    setDetailPosition({
      top: elementRect.top,
      left: elementRect.left,
      width: elementRect.width,
      height: elementRect.height
    });
    setSelectedArtefact(artefact);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
  };

  const handleViewToggle = () => {
    setIsGrid(!isGrid);
  };

  if (loading) {
    return (
      <div className="p-6">
        {/* SearchBar skeleton */}
        <div className="w-full max-w-3xl mx-auto mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
  
        {isGrid ? (
          // Grid skeleton
          <div className="w-full max-w-5xl mx-auto py-4 relative">
            <div className="max-h-[82vh] overflow-y-auto no-scrollbar rounded-xl">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-2 bg-gray-100">
                      <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Carousel skeleton
          <div className="fixed top-0 left-0 right-0 h-screen flex items-center justify-center">
            <div className="relative w-full max-w-5xl mx-auto h-[90vh] flex items-center justify-center">
              <div className="list-none w-full h-full relative flex flex-col items-center justify-center">
                {[-1, 0, 1].map((position) => (
                  <div
                    key={position}
                    className="absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: `translateY(${position * 170}px) scale(${position === 0 ? 1.2 : 0.9})`,
                      opacity: position === 0 ? 1 : 0.6,
                      zIndex: position === 0 ? 20 : 10,
                      width: position === 0 ? '70%' : '60%',
                      height: position === 0 ? '275px' : '80px',
                    }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      <div className="aspect-[16/10] bg-gray-200 animate-pulse"></div>
                      <div className="p-4 space-y-2 bg-gray-100">
                        <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <SearchBar 
        onSearch={handleSearch} 
        artefacts={artefacts}
        isGrid={isGrid}
        onViewToggle={handleViewToggle}
      />
      
      {filteredArtefacts.length > 0 ? (
        isGrid ? (
          <ArtefactGrid
            artefacts={filteredArtefacts}
            onArtefactSelect={handleArtefactSelect}
          />
        ) : (
          <ArtefactCarousel 
            artefacts={filteredArtefacts} 
            onArtefactSelect={handleArtefactSelect}
          />
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No artefacts found matching your search.</p>
        </div>
      )}
      
      <ArtefactDetail
        artefactId={selectedArtefact?.id}
        isOpen={detailOpen}
        onClose={handleDetailClose}
        onVisibilityChange={(visible) => {
          setSwipeEnabled(!visible);
        }}
      />
    </div>
  );
}