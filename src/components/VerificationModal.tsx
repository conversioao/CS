import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  userId: string;
  onSuccess: () => void;
}

const VerificationModal = ({ isOpen, userId, onSuccess }: VerificationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user', {
        body: { userId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');
      
      // Força a atualização da sessão do cliente para refletir o estado verificado
      await supabase.auth.refreshSession();

      toast.success("Conta ativada com sucesso!", {
        description: "A preparar o seu estúdio criativo...",
      });

      onSuccess();

    } catch (error: any) {
      toast.error("Erro na Ativação", {
        description: error.message || "Não foi possível ativar a sua conta. Tente novamente.",
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
            Para desbloquear todas as funcionalidades, por favor, clique no botão abaixo para ativar a sua conta.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="pt-4">
          <Button onClick={handleVerify} className="w-full gradient-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ativar Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;