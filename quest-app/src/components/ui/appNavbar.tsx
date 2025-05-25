'use client';
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import clsx from "clsx";

interface AppNavbarProps {
  currentIndex: number;
  onNavSelect: (index: number) => void;
}

const navItems = ['Quests', 'Scan', 'Artefacts', 'Profile'];

export default function AppNavbar({
  currentIndex, 
  onNavSelect
}: AppNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(currentIndex);
  const isScrolling = useRef(false);

  const handleScroll = useCallback(() => {
    if (!navRef.current) return;
    
    isScrolling.current = true;
    
    const scrollLeft = navRef.current.scrollLeft;
    const width = navRef.current.clientWidth;
    const center = scrollLeft + width / 2;

    const buttons = Array.from(navRef.current.children) as HTMLButtonElement[];
    const centers = buttons.map(btn => btn.offsetLeft + btn.offsetWidth / 2);

    const closestIndex = centers.reduce((prev, curr, i) =>
      Math.abs(curr - center) < Math.abs(centers[prev] - center) ? i : prev, 0
    );

    // Update highlighted index during scroll
    setHighlightedIndex(closestIndex);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // When scrolling stops, navigate to the page
    debounceTimer.current = setTimeout(() => {
      onNavSelect(closestIndex);
      isScrolling.current = false;
    }, 100);
  }, [onNavSelect]);

  // Handle clicks on navigation items
  const handleNavClick = (index: number) => {
    if (isScrolling.current) return;
    
    if (navRef.current) {
      const button = navRef.current.children[index] as HTMLButtonElement;
      if (button) {
        const scrollOffset = button.offsetLeft + button.offsetWidth / 2 - navRef.current.clientWidth / 2;
        navRef.current.scrollTo({ left: scrollOffset, behavior: 'smooth' });
  
        // Wait for the scroll to center the item before navigating
        setTimeout(() => {
          onNavSelect(index);
        }, 100); // ~300ms feels natural, adjust if needed
      } else {
        onNavSelect(index); // Fallback just in case
      }
    } else {
      onNavSelect(index); // Fallback just in case
    }
  };

  useEffect(() => {
    const el = navRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Sync highlighted index with current index when not scrolling
    if (!isScrolling.current) {
      setHighlightedIndex(currentIndex);
    }
  }, [currentIndex]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const active = el.children[currentIndex] as HTMLButtonElement;
    if (!active) return;

    const scrollOffset = active.offsetLeft + active.offsetWidth / 2 - el.clientWidth / 2;
    el?.scrollTo({ left: scrollOffset, behavior: 'smooth' });
  }, [currentIndex]);

  return (
    <nav
      ref={navRef}
      className="navbar w-full fixed bottom-0 bg-black/20 border-none z-50 overflow-x-auto no-scrollbar flex snap-x snap-mandatory px-4 pb-2 pt-3 pl-[50%] pr-[50%]"
    >
      {navItems.map((label, i) => (
        <Button
          key={label}
          variant={highlightedIndex === i ? "secondary" : "ghost"}
          className={clsx(
            "snap-center shrink-0 transition-all mx-2 text-center min-w-[80px]",
            {
              "font-bold text-lg": highlightedIndex === i,
              "text-muted-foreground": highlightedIndex !== i,
            }
          )}
          onClick={() => handleNavClick(i)}
        >
          {label}
        </Button>
      ))}
    </nav>
  );
}