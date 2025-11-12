import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const { user, profile, loading: sessionLoading, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false); // Novo estado para a tela de espera

  useEffect(() => {
    if (profile?.status === 'verified') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateAndSendCode = async () => {
    if (!user) return;
    
    setIsResending(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_code: newCode })
        .eq('id', user.id);

      if (updateError) throw updateError;

      console.log(`[SIMULAÇÃO] Código ${newCode} enviado para ${profile?.whatsapp_number}`);
      toast.success('Novo código enviado!', {
        description: 'Verifique seu WhatsApp para o novo código de 6 dígitos.',
      });
      
      setCountdown(60);
    } catch (error: any) {
      toast.error('Erro ao reenviar código', { description: error.message });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!user || verificationCode.length !== 6) {
      toast.error("Código inválido", { description: "O código deve ter 6 dígitos." });
      return;
    }
    
    setIsVerifying(true);
    setIsWaiting(true); // Inicia a tela de espera

    try {
      // 1. Envia o código e o ID do usuário para o webhook
      const response = await fetch('https://n8n.conversio.ao/webhook-test/verificacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao comunicar com o servidor de verificação.');
      }

      // 2. Espera 5 segundos
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. Após 5 segundos, recarrega o perfil para verificar o status
      await refetchProfile();

      // 4. Verifica se o status agora é 'verified'
      if (profile?.status === 'verified') {
        toast.success('Conta verificada com sucesso!');
        navigate('/onboarding');
      } else {
        // Se o status não mudou, o webhook pode ter rejeitado a verificação
        toast.error('Falha na verificação. O código pode estar incorreto ou expirado.');
      }

    } catch (error: any) {
      console.error(error);
      toast.error('Falha na verificação', { description: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsVerifying(false);
      setIsWaiting(false); // Finaliza a tela de espera
    }
  };

  if (sessionLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (profile.status === 'verified') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Conta Já Verificada!</h2>
            <p className="text-muted-foreground mb-6">Você será redirecionado para o painel.</p>
          </CardContent>
        </Card>
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
          <CardTitle className="text-2xl">Verifique a Sua Conta</CardTitle>
          <CardDescription>
            Enviámos um código de 6 dígitos para o seu WhatsApp para garantir a sua segurança.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tela de Espera */}
          {isWaiting && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aguarde...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estamos verificando o seu código com o servidor. Isso pode levar alguns segundos.
              </p>
            </div>
          )}

          {/* Formulário de Verificação (não mostra quando está esperando) */}
          {!isWaiting && (
            <>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono h-14"
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={generateAndSendCode}
                  disabled={isResending || countdown > 0}
                  className="flex-1"
                >
                  {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : (countdown > 0 ? <Clock className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />)}
                  {countdown > 0 ? `Aguarde ${countdown}s` : 'Reenviar Código'}
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1 gradient-primary"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Verificar Conta
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center pt-2">
                Não recebeu o código? Clique em "Reenviar Código" após 60 segundos.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;