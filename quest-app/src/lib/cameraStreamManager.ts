// lib/cameraStreamManager.ts
let stream: MediaStream | null = null;
let usageCount = 0;
let isInitializing = false;

export async function getCameraStream(): Promise<MediaStream> {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // Wait for existing initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (stream) return stream;
  }

  if (!stream) {
    isInitializing = true;
    try {
      // Check if mediaDevices is supported
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Samsung-friendly constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          // Samsung devices sometimes need these explicitly
          frameRate: { ideal: 30, max: 60 }
        }
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test if stream is actually working
      if (!stream || stream.getTracks().length === 0) {
        throw new Error('No camera tracks available');
      }

      console.log('Camera stream initialized successfully');
    } catch (error) {
      console.error('Camera initialization failed:', error);
      
      // Try fallback constraints for Samsung devices
      try {
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            // More relaxed constraints
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        console.log('Camera stream initialized with fallback constraints');
      } catch (fallbackError) {
        console.error('Fallback camera initialization failed:', fallbackError);
        throw new Error(`Camera access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      isInitializing = false;
    }
  }
  
  usageCount++;
  return stream;
}

export function releaseCameraStream() {
  usageCount = Math.max(usageCount - 1, 0);
  if (usageCount === 0 && stream) {
    try {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.kind);
      });
      stream = null;
      console.log('Camera stream released');
    } catch (error) {
      console.error('Error releasing camera stream:', error);
    }
  }
}

export function getCameraUsageCount(): number {
  return usageCount;
}

export function isStreamActive(): boolean {
  return stream !== null && !isInitializing;
}