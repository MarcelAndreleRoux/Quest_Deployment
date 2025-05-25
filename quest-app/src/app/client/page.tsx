'use client';

import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppNavbar from '@/components/ui/appNavbar';
import Quests from './_components/quests';
import Scan from './_components/scan';
import Artefacts from './_components/artefacts';
import Profile from './_components/profile';
import CameraBackground from '@/components/ui/cameraBackground';

function CameraRequiredPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center animate-fade-in max-w-xs">
        <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <div className="text-lg font-semibold text-gray-800 mb-4 text-center">
          This app heavily relies on camera usage.<br />
          Please allow camera access in your browser settings.
        </div>
        <button
          onClick={onClose}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded mt-2"
        >
          OK
        </button>
      </div>
    </div>
  );
}

const scrollNavToIndex = (index: number) => {
  const nav = document.querySelector('nav');
  const button = nav?.children[index] as HTMLButtonElement;
  if (button && nav) {
    const scrollOffset =
    button.offsetLeft + button.offsetWidth / 2 - nav.clientWidth / 2;
    nav.scrollTo({ left: scrollOffset, behavior: 'smooth' });
  }
};

const fadeVariants = {
  initial: { opacity: 0, filter: 'blur(8px)', scale: 0.98 },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    filter: 'blur(8px)',
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

export default function AppPage() {
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isSwipeEnabled, setSwipeEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [showCameraPopup, setShowCameraPopup] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const pages = [
    <Quests key="quests" />,
    <Scan key="scan" setSwipeEnabled={setSwipeEnabled} />,
    <Artefacts key="artefacts" setSwipeEnabled={setSwipeEnabled} />,
    <Profile key="profile" />,
  ];

  useEffect(() => {
    setIsScannerActive(currentIndex === 1); // 1 is the index of Scan page
  }, [currentIndex]);

  useEffect(() => {
    // Only check on mount
    async function checkCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === 'videoinput');
        if (!hasCamera) setShowCameraPopup(true);
      } catch {
        setShowCameraPopup(true);
      }
    }
    checkCamera();
  }, []);

  const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeEnabled) return;

    const startX = touchStartX.current;
    const endX = e.changedTouches[0].clientX;

    if (startX !== null) {
      const delta = endX - startX;
      if (Math.abs(delta) > 50) {
        if (delta < 0 && currentIndex < pages.length - 1) {
          scrollNavToIndex(currentIndex + 1);
          setTimeout(() => setCurrentIndex(currentIndex + 1), 100);
        } else if (delta > 0 && currentIndex > 0) {
          scrollNavToIndex(currentIndex - 1);
          setTimeout(() => setCurrentIndex(currentIndex - 1), 100);
        }
      }
    }
    touchStartX.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const scrollToSection = (index: number) => {
    setPreviousIndex(currentIndex);
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-transparent">
      {showCameraPopup && <CameraRequiredPopup onClose={() => setShowCameraPopup(false)} />}
      {/* Fade-switchable view */}
      <CameraBackground />
      <div
        className="h-full w-full absolute top-0 left-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleSwipe}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="h-full w-full overflow-y-auto"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {pages[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NavBar stays fixed on bottom */}
      <AppNavbar
        currentIndex={currentIndex}
        onNavSelect={scrollToSection}        
      />
    </div>
  );
}