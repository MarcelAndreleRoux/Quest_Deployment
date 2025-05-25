'use client';

import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { useEffect, useRef } from 'react';
import { getCameraStream, releaseCameraStream } from '@/lib/cameraStreamManager';

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

  useEffect(() => {
    if (!isActive || !qrRef.current) return;

    const initScanner = async () => {
      try {
        await getCameraStream(); // Optional, handles permissions
        scanner.current = new Html5Qrcode('qr-scanner');

        const config: Html5QrcodeCameraScanConfig = {
          fps,
          qrbox: qrbox ?? undefined,
        };

        await scanner.current.start(
          { facingMode: preferredCamera },
          config,
          onScanSuccess,
          () => {} // Optional: decode failure callback
        );

        onScannerInit(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize QR scanner';
        console.error('QR Scanner init error:', err);
        onScannerInit(false);
        onScanError(errorMessage);
      }
    };

    initScanner();

    return () => {
      if (scanner.current) {
        scanner.current
          .stop()
          .then(() => {
            scanner.current?.clear();
            releaseCameraStream();
          })
          .catch((e) => {
            console.error('Error stopping scanner:', e);
          });
      }
    };
  }, [isActive, fps, qrbox, preferredCamera, onScanSuccess, onScanError, onScannerInit]);

  return (
    <div
      id="qr-scanner"
      ref={qrRef}
      className={`relative ${fullView ? 'w-full h-full' : 'w-[300px] h-[300px]'} overflow-hidden`}
    />
  );
}