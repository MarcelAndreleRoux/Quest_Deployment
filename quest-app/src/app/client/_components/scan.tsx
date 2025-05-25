'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/ui/QRScanner';
import { isMobile } from 'react-device-detect';
{/* Temp code for demo */}
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
{/* Temp code for demo */}
import { useHasMounted } from '@/hooks/useHasMounted';
import QRCodeGenerator from '@/components/QRGenerator';
import ArtefactDetail from '@/components/ui/artefactDetails';

export default function Scan({ setSwipeEnabled }: { setSwipeEnabled: (enabled: boolean) => void }) {
  const hasMounted = useHasMounted();
  {/* Temp code for demo */}
  const router = useRouter();
  {/* Temp code for demo */}
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    try {
      const parsedData = JSON.parse(decodedText);
      setScanResult(parsedData.artefactId);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      setScanError('Invalid QR code data. Please try again.');
      setTimeout(() => setScanError(null), 3000);
    }
  };

  const handleScanError = (error: string) => {
    if (!error.toLowerCase().includes('no qr code found')) {
      setScanError(error);
      setTimeout(() => setScanError(null), 3000);
    }
  };

  const handleScannerInit = (success: boolean) => {
    if (!success && !scanError) {
      setScanError('Failed to initialize camera. Please try again.');
    }
  };

  const handleDetailClose = () => {
    // Only update state - the animation handles the actual closing
    setScanResult(null);
  };

  const detailPosition = {
      top: '50%',
      left: '50%',
      width: 0,
      height: 0
  };

  useEffect(() => {
    setIsScannerActive(true);
    return () => setIsScannerActive(false);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Scan QR Code</h1>
        
        <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onScannerInit={handleScannerInit}
            qrbox={isMobile ? undefined : 250}
            fps={10}
            preferredCamera="environment"
            isActive={isScannerActive}
            fullView={isMobile}
          />

          {!isMobile && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/50 rounded-xl">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl" />
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Temp code for demo */}
        <ArtefactDetail
          artefactId={scanResult} // Extracting the ID from the scan result
          isOpen={!!scanResult}
          onClose={handleDetailClose}
          onVisibilityChange={(visible) => {
            setSwipeEnabled(!visible);
          }}
        />
        {/* Temp code for demo */}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}