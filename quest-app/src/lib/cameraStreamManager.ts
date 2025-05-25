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

      // List available devices first
      let availableDevices: MediaDeviceInfo[] = [];
      try {
        availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.length);
        
        if (videoDevices.length === 0) {
          throw new Error('No video input devices found');
        }
      } catch (enumError) {
        console.warn('Could not enumerate devices:', enumError);
      }

      // Try multiple constraint configurations in order of preference
      const constraintOptions: MediaStreamConstraints[] = [
        // Option 1: Basic video only (most compatible)
        {
          video: true
        },
        // Option 2: Simple constraints
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Option 3: Try user camera (front)
        {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Option 4: Try environment camera if available
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        }
      ];

      let lastError: Error | null = null;

      for (let i = 0; i < constraintOptions.length; i++) {
        try {
          console.log(`Trying camera constraint option ${i + 1}...`);
          stream = await navigator.mediaDevices.getUserMedia(constraintOptions[i]);
          
          // Test if stream is actually working
          if (stream && stream.getTracks().length > 0) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack && videoTrack.readyState === 'live') {
              console.log(`Camera stream initialized successfully with option ${i + 1}`);
              console.log('Video track settings:', videoTrack.getSettings());
              break;
            }
          }
          
          // Stream is not working properly, clean up and try next option
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        } catch (error) {
          lastError = error as Error;
          console.warn(`Camera constraint option ${i + 1} failed:`, error);
          
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        }
      }

      if (!stream) {
        throw new Error(`All camera initialization attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Camera initialization failed:', error);
      throw new Error(`Camera access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Helper function to get available camera devices
export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  try {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      return [];
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error getting available cameras:', error);
    return [];
  }
}