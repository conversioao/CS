import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraCaptureDialog = ({ isOpen, onClose, onCapture }: CameraCaptureDialogProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          toast({
            title: "Erro de Câmera",
            description: "Não foi possível acessar a câmera. Verifique as permissões.",
            variant: "destructive",
          });
          onClose();
        } finally {
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, toast, onClose, stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
          onCapture(file);
        }
      }, 'image/png');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Capturar Imagem</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {isLoading && <Loader2 className="w-8 h-8 text-white animate-spin" />}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${isLoading ? 'hidden' : ''}`}
            onCanPlay={() => setIsLoading(false)}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleCapture} disabled={isLoading}>
            <Camera className="w-4 h-4 mr-2" />
            Capturar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCaptureDialog;