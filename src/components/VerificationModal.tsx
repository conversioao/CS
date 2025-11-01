import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  userId: string;
}

const VerificationModal = ({ isOpen, userId }: VerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user', {
        body: { userId, verificationCode }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');

      toast.success("Conta verificada com sucesso!", {
        description: "O seu acesso foi totalmente liberado.",
      });
      
      // Recarregar a página para atualizar o estado da sessão
      window.location.reload();

    } catch (error: any) {
      toast.error("Código de Verificação Inválido", {
        description: error.message || "Por favor, verifique o código e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Ative a sua Conta</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Para desbloquear todas as funcionalidades, por favor, insira o código de verificação que enviámos para o seu WhatsApp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <Label htmlFor="verification-code">Código de Verificação</Label>
          <Input 
            id="verification-code" 
            placeholder="O código é 123456" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button onClick={handleVerify} className="w-full gradient-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar e Ativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;