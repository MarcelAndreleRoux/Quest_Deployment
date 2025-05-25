'use client';
import { useEffect, useRef } from 'react';
import { getCameraStream, releaseCameraStream } from '@/lib/cameraStreamManager';

export default function CameraBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let localStream: MediaStream;

    const setupCamera = async () => {
      try {
        localStream = await getCameraStream();
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error('Camera setup failed:', err);
      }
    };

    setupCamera();

    return () => {
      releaseCameraStream();
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-10]"
      />
      <div className="fixed top-0 left-0 w-full h-full z-[-9] backdrop-blur-md bg-black/20" />
    </>
  );
}