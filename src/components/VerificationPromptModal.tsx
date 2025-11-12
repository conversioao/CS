import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VerificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: () => void; // Callback for successful verification
}

const VerificationPromptModal = ({ isOpen, onClose, onVerify }: VerificationPromptModalProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error("Por favor, insira o código de verificação.");
      return;
    }

    setIsVerifying(true);
    try {
      // The verification code should match the user's ID
      // This is a simplified version for demonstration
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error("Usuário não encontrado.");
      }

      if (user.id === verificationCode) {
        // Update profile status to verified
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ status: 'verified' })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast.success("Conta verificada com sucesso!");
        onClose();
        onVerify?.(); // Call the callback if provided
      } else {
        toast.error("Código de verificação inválido.");
      }
    } catch (error: any) {
      toast.error("Erro na verificação", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Verifique a sua conta
          </DialogTitle>
          <DialogDescription>
            Para acessar todas as ferramentas, por favor, verifique a sua conta.
            O código de verificação é o mesmo que o seu ID de utilizador.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de Verificação</Label>
            <Input
              id="verification-code"
              placeholder="Digite o seu código"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              O código é o mesmo que o seu ID de utilizador.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="flex-1 gradient-primary"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationPromptModal;