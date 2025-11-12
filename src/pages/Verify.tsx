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
    // 1. Desativa o botão e inicia o processo
    setIsVerifying(true);
    console.log("Iniciando processo de verificação...");

    if (!user) {
      toast.error("Sessão não encontrada. Por favor, faça login novamente.");
      setIsVerifying(false);
      return;
    }
    if (!verificationCode) {
      toast.error("Por favor, insira o código de verificação.");
      setIsVerifying(false);
      return;
    }

    try {
      // 2. Compara o código digitado com o ID do usuário
      console.log(`Verificando código digitado: "${verificationCode}" com ID do usuário: "${user.id}"`);
      if (verificationCode !== user.id) {
        // Lança um erro específico se o código estiver incorreto
        throw new Error("❌ Código incorreto. Tente novamente.");
      }

      console.log("Código correto. Tentando atualizar o status no banco de dados...");
      
      // 3. Atualiza o status do perfil para 'verificado'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', user.id);

      if (updateError) {
        // Lança um erro se a atualização do banco de dados falhar
        console.error("Erro ao atualizar o status:", updateError);
        throw new Error("⚠️ Erro ao atualizar seu status. Tente novamente.");
      }

      console.log("Status atualizado com sucesso no banco de dados.");
      toast.success("✅ Conta verificada com sucesso!");

      // 4. Atualiza o perfil localmente para que o ProtectedRoute possa redirecionar
      await refetchProfile();
      
      // **CORREÇÃO PRINCIPAL:** Removemos o redirecionamento daqui.
      // O componente ProtectedRoute agora cuidará do redirecionamento ao detectar a mudança de status.
      // navigate('/onboarding'); // <-- LINHA REMOVIDA PARA CORRIGIR O LOOP

    } catch (error: any) {
      // 5. Captura e exibe qualquer erro que ocorreu durante o processo
      console.error("Falha na verificação:", { message: error.message, stack: error.stack });
      toast.error("Falha na verificação", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      // 6. Reativa o botão, independentemente do resultado
      console.log("Processo de verificação finalizado.");
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