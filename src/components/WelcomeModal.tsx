import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, CheckCircle, Smartphone } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified?: boolean;
}

const WelcomeModal = ({ isOpen, onClose, isVerified = false }: WelcomeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isVerified ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <PartyPopper className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {isVerified ? "Bem-vindo, Verificado!" : "Bem-vindo ao Conversio Studio!"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isVerified 
              ? "Sua conta foi criada e verificada com sucesso. Você ganhou 50 créditos para começar a criar." 
              : "Sua conta foi criada com sucesso. Você ganhou 50 créditos para começar a criar."
            }
          </DialogDescription>
        </DialogHeader>
        
        {isVerified && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Smartphone className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Número de WhatsApp Verificado</span>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full gradient-primary">
            Iniciar Tour Rápido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;