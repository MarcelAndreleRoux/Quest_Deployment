'use client';

import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const initializationAttempt = useRef(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a unique scannerId for this component instance
  const scannerId = `qr-scanner-container-${useRef(Math.random().toString(36).substr(2, 9)).current}`;

  const safeCleanup = useCallback(async () => {
    if (scanner.current && !isCleaningUp.current) {
      isCleaningUp.current = true;
      
      try {
        const state = scanner.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || 
            state === Html5QrcodeScannerState.PAUSED) {
          await scanner.current.stop();
        }
      } catch (stopError) {
        console.debug('Scanner stop error (expected if not running):', stopError);
      }
      
      try {
        // Wait a bit before clearing to avoid DOM manipulation issues
        await new Promise(resolve => setTimeout(resolve, 100));
        if (scanner.current) {
          scanner.current.clear();
        }
      } catch (clearError) {
        console.debug('Scanner clear error:', clearError);
      }
      
      scanner.current = null;
      isCleaningUp.current = false;
      console.log('QR Scanner cleaned up safely');
    }
  }, []);

  useEffect(() => {
    if (!isActive || !qrRef.current || isInitializing || isCleaningUp.current) return;

    const currentAttempt = ++initializationAttempt.current;

    const initScanner = async () => {
      // Check if this initialization attempt is still valid
      if (currentAttempt !== initializationAttempt.current) {
        console.log('Skipping outdated initialization attempt');
        return;
      }

      setIsInitializing(true);
      setError(null);
      
      try {
        // Clean up any existing scanner first
        await safeCleanup();

        // Wait for cleanup and DOM updates
        await new Promise(resolve => setTimeout(resolve, 300));

        // Verify we should still proceed
        if (currentAttempt !== initializationAttempt.current || !isActive) {
          return;
        }

        // Ensure the element exists and has the correct ID
        if (!qrRef.current) {
          throw new Error('QR scanner container not found');
        }

        // Set the ID on the element
        qrRef.current.id = scannerId;

        scanner.current = new Html5Qrcode(scannerId);

        const config: Html5QrcodeCameraScanConfig = {
          fps: Math.min(fps, 10), // Conservative FPS for stability
          qrbox: qrbox ?? undefined,
          aspectRatio: 1.0,
          disableFlip: false,
        };

        // Define camera constraint options in order of preference
        const cameraOptions = [
          // Option 1: Exact environment facing mode
          { facingMode: 'environment' },
          // Option 2: Ideal environment facing mode (fallback)
          { facingMode: { ideal: 'environment' } },
          // Option 3: Any back camera
          { facingMode: { exact: 'environment' } },
          // Option 4: User camera fallback
          { facingMode: 'user' },
          // Option 5: Any available camera
          undefined
        ];

        let scannerStarted = false;
        let lastError: Error | null = null;

        for (let i = 0; i < cameraOptions.length; i++) {
          // Check if we should still proceed
          if (currentAttempt !== initializationAttempt.current || !isActive) {
            return;
          }

          try {
            console.log(`Trying camera option ${i + 1}:`, cameraOptions[i]);
            
            await scanner.current!.start(
              cameraOptions[i] || { facingMode: preferredCamera },
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

            scannerStarted = true;
            console.log(`QR Scanner started successfully with option ${i + 1}`);
            onScannerInit(true);
            break;

          } catch (cameraError) {
            lastError = cameraError as Error;
            console.warn(`Camera option ${i + 1} failed:`, cameraError);
            
            // If scanner was partially initialized, clean it up before trying next option
            if (scanner.current) {
              try {
                const state = scanner.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING || 
                    state === Html5QrcodeScannerState.PAUSED) {
                  await scanner.current.stop();
                }
              } catch (stopError) {
                console.debug('Stop error during fallback:', stopError);
              }
            }
          }
        }

        if (!scannerStarted) {
          throw lastError || new Error('All camera options failed');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize QR scanner';
        console.error('QR Scanner init error:', err);
        
        // Provide more specific error messages
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
          userFriendlyMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
        } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('Requested device not found')) {
          userFriendlyMessage = 'No camera found. Please ensure your device has a camera and try refreshing the page.';
        } else if (errorMessage.includes('NotSupportedError')) {
          userFriendlyMessage = 'Camera not supported in this browser. Please try Chrome or Safari.';
        } else if (errorMessage.includes('NotReadableError')) {
          userFriendlyMessage = 'Camera is already in use by another application. Please close other camera apps and try again.';
        }
        
        setError(userFriendlyMessage);
        onScannerInit(false);
        onScanError(userFriendlyMessage);
      } finally {
        // Only update state if this is still the current attempt
        if (currentAttempt === initializationAttempt.current) {
          setIsInitializing(false);
        }
      }
    };

    // Add a small delay before initializing to ensure DOM is ready
    const timer = setTimeout(initScanner, 200);
    
    return () => {
      clearTimeout(timer);
      // Mark this attempt as outdated
      if (currentAttempt === initializationAttempt.current) {
        initializationAttempt.current++;
      }
    };
  }, [isActive, fps, qrbox, preferredCamera, onScanSuccess, onScanError, onScannerInit, scannerId, safeCleanup]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      safeCleanup();
    };
  }, [safeCleanup]);

  return (
    <div
      ref={qrRef}
      className={`relative ${fullView ? 'w-full h-full' : 'w-[300px] h-[300px]'} overflow-hidden rounded-lg bg-black`}
    >
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-black bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}
      
      {error && !isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-red-900 bg-opacity-75">
          <div className="text-center p-4">
            <div className="text-red-200 mb-2">⚠️</div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}