import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const WelcomeModal = ({ isOpen, onClose, userName }: WelcomeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Conta Verificada, {userName}!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Você ganhou <strong>50 créditos</strong> para usar durante os próximos 2 dias. Explore todo o poder da nossa plataforma e comece a criar!
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full gradient-primary">
            Boas-vindas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;