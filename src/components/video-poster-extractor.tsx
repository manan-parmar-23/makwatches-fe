import { useRef, useEffect } from "react";

interface VideoPosterExtractorProps {
  videoSrc: string;
  onPosterReady: (posterUrl: string) => void;
  captureTimeInSeconds?: number;
}

/**
 * This component extracts a frame from a video to be used as a poster image
 * It will load the video, seek to the specified time, capture a frame, and then call the callback
 */
const VideoPosterExtractor: React.FC<VideoPosterExtractorProps> = ({
  videoSrc,
  onPosterReady,
  captureTimeInSeconds = 1, // Default to 1 second from end for better frame capture
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");

    videoRef.current = video;
    canvasRef.current = canvas;

    video.crossOrigin = "anonymous"; // To avoid CORS issues when capturing frame
    video.src = videoSrc;
    video.preload = "auto";

    // When metadata is loaded, we know the video dimensions
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Get the duration and set time to near the end (last second) for better poster frame
      // This ensures we get a good frame that represents the video's last moment
      const captureTime =
        captureTimeInSeconds > 0
          ? video.duration - captureTimeInSeconds
          : Math.max(0, video.duration - 1); // Default to 1 second from end
      video.currentTime = captureTime;
    };

    // When seeking completes and the frame is available
    video.onseeked = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL and call the callback
        const posterUrl = canvas.toDataURL("image/jpeg", 0.95);
        onPosterReady(posterUrl);
      }
    };

    // Clean up
    return () => {
      video.src = "";
      video.onloadedmetadata = null;
      video.onseeked = null;
    };
  }, [videoSrc, captureTimeInSeconds, onPosterReady]);

  // This component doesn't render anything
  return null;
};

export default VideoPosterExtractor;
