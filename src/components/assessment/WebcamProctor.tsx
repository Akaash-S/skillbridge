import { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WebcamProctorProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export const WebcamProctor = ({ onPermissionGranted, onPermissionDenied }: WebcamProctorProps) => {
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
    <div className="relative w-full max-w-[200px] aspect-video bg-black rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover mirror"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
          <CameraOff className="h-8 w-8 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting Camera</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-destructive/90 flex items-center justify-center p-4 text-center">
          <Alert variant="destructive" className="border-none bg-transparent p-0">
            <AlertCircle className="h-4 w-4 mx-auto mb-1" />
            <AlertTitle className="text-[10px]">Error</AlertTitle>
            <AlertDescription className="text-[10px]">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
        <div className={stream ? "h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" : "h-1.5 w-1.5 rounded-full bg-red-500"} />
        <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Monitor</span>
      </div>
    </div>
  );
};
