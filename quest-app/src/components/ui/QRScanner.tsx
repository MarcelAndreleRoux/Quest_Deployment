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
  fps = 10,
  qrbox,
  preferredCamera = 'environment',
  fullView = false,
}: QRScannerProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const scanner = useRef<Html5Qrcode | null>(null);
  const isCleaningUp = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);
  // Generate a unique scannerId for this component instance
  const scannerId = 'qr-scanner-container';

  useEffect(() => {
    if (!isActive || !qrRef.current || isInitializing || isCleaningUp.current) return;

    const initScanner = async () => {
      setIsInitializing(true);
      
      try {
        // Clean up any existing scanner first with proper state checking
        if (scanner.current) {
          try {
            const state = scanner.current.getState();
            if (state === Html5QrcodeScannerState.SCANNING || 
                state === Html5QrcodeScannerState.PAUSED) {
              if (scanner.current) {
                await scanner.current.stop();
              }
            }
          } catch (stopError) {
            console.debug('Scanner stop error (expected if not running):', stopError);
          }
          
          try {
            scanner.current.clear();
          } catch (clearError) {
            console.debug('Scanner clear error:', clearError);
          }
          
          scanner.current = null;
        }

        // Ensure the element exists and has the correct ID
        if (!qrRef.current) {
          throw new Error('QR scanner container not found');
        }

        // Give a small delay for cleanup and DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));

        // Double-check the element still exists after delay
        if (!qrRef.current) {
          throw new Error('QR scanner container removed during initialization');
        }

        // Verify the element is in the DOM
        if (!document.getElementById(scannerId)) {
          throw new Error(`HTML Element with id=${scannerId} not found`);
        }

        scanner.current = new Html5Qrcode(scannerId);

        const config: Html5QrcodeCameraScanConfig = {
          fps: Math.min(fps, 15), // Conservative FPS for Samsung devices
          qrbox: qrbox ?? undefined,
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
              // Only log decode errors occasionally to avoid spam
              if (Math.random() < 0.01) {
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
        if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
          userFriendlyMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('not found')) {
          userFriendlyMessage = 'Scanner initialization failed. Please refresh the page and try again.';
        } else if (errorMessage.includes('NotSupportedError')) {
          userFriendlyMessage = 'Camera not supported in this browser. Please try Chrome or Safari.';
        }
        
        onScannerInit(false);
        onScanError(userFriendlyMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    // Add a small delay before initializing to ensure DOM is ready
    const timer = setTimeout(initScanner, 100);
    
    return () => {
      clearTimeout(timer);
      
      if (scanner.current && !isCleaningUp.current) {
        isCleaningUp.current = true;
        
        // Safe cleanup with state checking
        const cleanup = async () => {
          try {
            const state = scanner.current?.getState();
            if (state === Html5QrcodeScannerState.SCANNING || 
                state === Html5QrcodeScannerState.PAUSED) {
              if (scanner.current) {
                await scanner.current.stop();
              }
            }
          } catch (stopError) {
            // Expected if scanner is not running
            console.debug('Cleanup stop error (expected):', stopError);
          }
          
          try {
            scanner.current?.clear();
          } catch (clearError) {
            console.debug('Cleanup clear error:', clearError);
          }
          
          scanner.current = null;
          isCleaningUp.current = false;
          console.log('QR Scanner cleaned up');
        };
        
        cleanup();
      }
    };
  }, [isActive, fps, qrbox, preferredCamera, onScanSuccess, onScanError, onScannerInit, scannerId]);

  return (
    <div
      id={scannerId}
      ref={qrRef}
      className={`relative ${fullView ? 'w-full h-full' : 'w-[300px] h-[300px]'} overflow-hidden rounded-lg bg-black`}
    >
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}