import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

interface VerificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationPromptModal = ({ isOpen, onClose }: VerificationPromptModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Verificação Necessária</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Para utilizar as ferramentas de IA, precisa de verificar a sua conta nas configurações.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Link to="/account">
            <Button className="gradient-primary">Ir para Configurações</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationPromptModal;