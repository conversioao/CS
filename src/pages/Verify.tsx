import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Verify = () => {
  const { user, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!user) {
      toast.error("Sessão não encontrada. Por favor, faça login novamente.");
      return;
    }
    if (!verificationCode) {
      toast.error("Por favor, insira o código de verificação.");
      return;
    }

    setIsVerifying(true);
    try {
      // O código de verificação é o próprio ID do usuário.
      if (verificationCode !== user.id) {
        throw new Error("❌ Código incorreto. Tente novamente.");
      }

      // Atualiza o status do perfil para 'verificado'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("✅ Conta verificada com sucesso!");
      
      // Atualiza o perfil no contexto para refletir o novo status
      await refetchProfile();

      // Redireciona para a tela de onboarding
      navigate('/onboarding');

    } catch (error: any) {
      toast.error(error.message || "Falha na verificação.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificação de Conta</CardTitle>
          <CardDescription>
            Para ativar sua conta, insira o código de verificação que é o seu ID de usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de Verificação</Label>
            <Input
              id="verification-code"
              placeholder="Cole seu ID de usuário aqui"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
             <p className="text-xs text-muted-foreground">
              Seu ID de usuário foi enviado para o seu WhatsApp durante o cadastro.
            </p>
          </div>
          <Button onClick={handleVerify} className="w-full gradient-primary" disabled={isVerifying}>
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar Conta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;