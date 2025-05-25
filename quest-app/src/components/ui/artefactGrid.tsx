import { useRef } from 'react';
import { ArtefactCard } from "./artefactCard";
import type { Artefact as ArtefactType } from "@/lib/types";

interface ArtefactGridProps {
  artefacts: ArtefactType[];
  onArtefactSelect?: (artefact: ArtefactType, elementRect: DOMRect) => void;
}

export default function ArtefactGrid({ artefacts, onArtefactSelect }: ArtefactGridProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Handle click on an artefact
  const handleItemClick = (artefact: ArtefactType) => {
    if (onArtefactSelect) {
      const itemRef = itemRefs.current[artefact.id];
      if (itemRef) {
        const rect = itemRef.getBoundingClientRect();
        onArtefactSelect(artefact, rect);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 relative">
      <div className="max-h-[82vh] overflow-y-auto no-scrollbar rounded-xl">
        <div className="grid grid-cols-2 gap-6">
          {artefacts.map((artefact) => (
            <div 
              key={artefact.id}
              ref={(el) => {itemRefs.current[artefact.id] = el}}
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleItemClick(artefact)}
            >
              <ArtefactCard
                id={artefact.id}
                name={artefact.name}
                description={artefact.description}
                isCenter={false}
                isGrid={true}
                image={typeof artefact.image === 'string' ? artefact.image : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}