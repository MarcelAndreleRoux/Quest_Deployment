'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Artefact } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import { Filter, Grid, Layers } from 'lucide-react';

interface SearchBarProps {
  onSearch: (results: Artefact[]) => void;
  artefacts: Artefact[];
  isGrid: boolean;
  onViewToggle: () => void;
}

export default function SearchBar({ 
  onSearch, 
  artefacts, 
  isGrid,
  onViewToggle 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Get unique groups from artefacts, filtering out undefined values
  const groups = Array.from(new Set(artefacts
    .map(artefact => artefact.group)
    .filter((group): group is string => group !== undefined)));

  // Initialize Fuse instance with our artefacts using useMemo
  const fuse = useMemo(() => new Fuse(artefacts, {
    keys: ['name', 'description'],
    threshold: 0.4,
    includeScore: true
  }), [artefacts]);

  const updateResults = useCallback(() => {
    let results: Artefact[] = [];
    
    // Apply search if there's a search term
    if (searchTerm) {
      const fuseResults = fuse.search(searchTerm);
      results = fuseResults.map(result => result.item);
    } else {
      results = [...artefacts]; // Show all artefacts when search is empty
    }

    // Apply group filter if selected
    if (selectedGroup) {
      results = results.filter(artefact => artefact.group && artefact.group === selectedGroup);
    }

    onSearch(results);
  }, [artefacts, fuse, onSearch, searchTerm, selectedGroup]);

  // This effect runs whenever searchTerm or selectedGroup changes
  useEffect(() => {
    updateResults();
  }, [searchTerm, selectedGroup, updateResults]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleGroupFilter = (group: string | null) => {
    setSelectedGroup(group);
  };

  return (
    <div className="searchBar top-4 flex-1 z-50">
      <div className="relative w-full max-w-3xl mx-auto flex flex-col gap-2 z-50">
        <div className='flex items-center gap-2'>
        {/* View Toggle Button */}
          <Button 
            onClick={onViewToggle} 
            variant="secondary" 
            className="flex gap-2"
            aria-label={isGrid ? "Switch to list view" : "Switch to grid view"}
          >
            {isGrid ? <Layers size={18} /> : <Grid size={18} />}
          </Button>

          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search artefacts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-secondary border-none"
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex gap-2">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleGroupFilter(null)}>
                All Groups
              </DropdownMenuItem>
              {groups.map(group => (
                <DropdownMenuItem 
                  key={group} 
                  onClick={() => handleGroupFilter(group)}
                  className={selectedGroup === group ? 'bg-accent' : ''}
                >
                  {group}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      {selectedGroup && (
        <Button 
          onClick={() => handleGroupFilter(null)}
          className='w-full'
        >
          Clear {selectedGroup} Filter
        </Button>
      )}
      </div>
    </div>
  );
}