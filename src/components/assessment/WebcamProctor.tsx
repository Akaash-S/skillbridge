import { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WebcamProctorProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  className?: string;
}

export const WebcamProctor = ({ onPermissionGranted, onPermissionDenied, className }: WebcamProctorProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      onPermissionGranted();
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Webcam access is required for proctored assessments.");
      onPermissionDenied();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={cn(
      "relative w-full max-w-[240px] aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-sm mx-auto",
      className
    )}>
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover mirror grayscale-[0.5] hover:grayscale-0 transition-all duration-500"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
          <CameraOff className="h-6 w-6 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Initializing...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm flex items-center justify-center p-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-[10px] font-bold text-destructive leading-tight">{error}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md border shadow-sm">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          stream ? "bg-green-500 animate-pulse" : "bg-destructive"
        )} />
        <span className="text-[8px] font-bold uppercase tracking-tighter text-foreground/70">Live</span>
      </div>
    </div>
  );
};
