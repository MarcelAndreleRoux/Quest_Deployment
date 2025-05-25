let stream: MediaStream | null = null;
let usageCount = 0;

export async function getCameraStream(): Promise<MediaStream> {
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
  }
  usageCount++;
  return stream;
}

export function releaseCameraStream() {
  usageCount = Math.max(usageCount - 1, 0);
  if (usageCount === 0 && stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}