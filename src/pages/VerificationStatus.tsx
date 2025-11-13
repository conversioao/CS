import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

const VerificationStatus = () => {
  const { user, profile, loading: sessionLoading, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'pending' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user || sessionLoading) return;

      try {
        // Aguarda um pouco para garantir que o processo de verificação foi concluído
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Atualiza o perfil do usuário
        await refetchProfile();
        
        // Verifica o status no banco de dados
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (data?.status === 'verified') {
          setVerificationStatus('verified');
          toast.success("Conta verificada com sucesso!");
          
          // Redireciona para login após 3 segundos
          setTimeout(async () => {
            await supabase.auth.signOut();
            navigate('/login');
          }, 3000);
        } else {
          setVerificationStatus('pending');
        }
      } catch (error: any) {
        console.error("Erro ao verificar status:", error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Erro ao verificar o status da conta.');
      }
    };

    checkVerificationStatus();
  }, [user, sessionLoading, refetchProfile, navigate]);

  const handleContinue = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (sessionLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center">
          <img src={logo} alt="Conversio Studio" className="h-12 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl">Verificando sua conta</CardTitle>
          <CardDescription>
            Estamos verificando o status da sua conta. Aguarde um momento.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationStatus === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verificando...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estamos confirmando o status da sua conta.
              </p>
            </div>
          )}

          {verificationStatus === 'verified' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Conta Verificada!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Sua conta foi verificada com sucesso. Você será redirecionado para o login em instantes.
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-full animate-pulse"></div>
              </div>
            </div>
          )}

          {verificationStatus === 'pending' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-semibold">Verificação Pendente</h3>
              <p className="text-sm text-muted-foreground text-center">
                Sua conta ainda não foi verificada. Por favor, verifique seu WhatsApp e tente novamente.
              </p>
              <Button onClick={handleContinue} className="w-full gradient-primary">
                Voltar para Verificação
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold">Erro na Verificação</h3>
              <p className="text-sm text-muted-foreground text-center">
                {errorMessage || 'Ocorreu um erro ao verificar sua conta. Por favor, tente novamente.'}
              </p>
              <Button onClick={handleContinue} className="w-full gradient-primary">
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationStatus;