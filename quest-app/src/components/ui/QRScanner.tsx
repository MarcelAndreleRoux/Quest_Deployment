'use client';

import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError: (errorMessage: string) => void;
  onScannerInit: (success: boolean) => void;
  isActive: boolean;
  fps?: number;
  qrbox?: number;
  preferredCamera?: string;
  fullView?: boolean;
}

export default function QRScanner({
  onScanSuccess,
  onScanError,
  onScannerInit,
  isActive,
  fps = 15,
  qrbox,
  preferredCamera = 'environment',
  fullView = false,
}: QRScannerProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const scanner = useRef<Html5Qrcode | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!isActive || !qrRef.current || isInitializing) return;

    const initScanner = async () => {
      setIsInitializing(true);
      
      try {
        // Clean up any existing scanner first
        if (scanner.current) {
          await scanner.current.stop().catch(() => {});
          scanner.current.clear();
          scanner.current = null;
        }

        // Give a small delay for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        scanner.current = new Html5Qrcode('qr-scanner');

        const config: Html5QrcodeCameraScanConfig = {
          fps: Math.min(fps, 15), // Limit FPS for Samsung devices
          qrbox: qrbox ?? undefined,
          // Samsung-friendly settings
          aspectRatio: 1.0,
          disableFlip: false,
        };

        // Try with preferred camera first
        try {
          await scanner.current.start(
            { facingMode: preferredCamera },
            config,
            (decodedText, decodedResult) => {
              console.log('QR Code scanned:', decodedText);
              onScanSuccess(decodedText, decodedResult);
            },
            (errorMessage) => {
              // Only log decode errors if they're frequent
              if (Math.random() < 0.01) { // Log 1% of decode errors
                console.debug('QR decode error:', errorMessage);
              }
            }
          );

          console.log('QR Scanner started successfully');
          onScannerInit(true);
        } catch (cameraError) {
          console.warn('Preferred camera failed, trying any available camera:', cameraError);
          
          // Fallback: try any available camera
          await scanner.current.start(
            { facingMode: { ideal: preferredCamera } },
            config,
            (decodedText, decodedResult) => {
              console.log('QR Code scanned:', decodedText);
              onScanSuccess(decodedText, decodedResult);
            },
            () => {} // Silent decode errors for fallback
          );

          console.log('QR Scanner started with fallback camera');
          onScannerInit(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize QR scanner';
        console.error('QR Scanner init error:', err);
        
        // Provide more specific error messages for common Samsung issues
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('Permission')) {
          userFriendlyMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (errorMessage.includes('NotFoundError')) {
          userFriendlyMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (errorMessage.includes('NotAllowedError')) {
          userFriendlyMessage = 'Camera access blocked. Please check your browser settings.';
        }
        
        onScannerInit(false);
        onScanError(userFriendlyMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      if (scanner.current) {
        scanner.current
          .stop()
          .then(() => {
            scanner.current?.clear();
            scanner.current = null;
            console.log('QR Scanner cleaned up');
          })
          .catch((e) => {
            console.error('Error stopping QR scanner:', e);
          });
      }
    };
  }, [isActive, fps, qrbox, preferredCamera, onScanSuccess, onScanError, onScannerInit]);

  return (
    <div
      id="qr-scanner"
      ref={qrRef}
      className={`relative ${fullView ? 'w-full h-full' : 'w-[300px] h-[300px]'} overflow-hidden rounded-lg bg-black`}
    >
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}