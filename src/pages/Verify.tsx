import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, CheckCircle, Clock, Loader2, AlertCircle, RotateCcw } from "lucide-react";
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
  const [isWaiting, setIsWaiting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);
  const maxResendAttempts = 3;

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
    if (resendAttempts >= maxResendAttempts) {
      toast.error('Limite de reenvios atingido', { description: `Você atingiu o limite de ${maxResendAttempts} reenvios.` });
      return;
    }
    
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
      setResendAttempts(prev => prev + 1);
    } catch (error: any) {
      toast.error('Erro ao reenviar código', { description: error.message });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!user || verificationCode.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    
    setIsVerifying(true);
    setIsWaiting(true);
    setError(null);

    try {
      // Envia os dados para o webhook
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

      // Aguarda 5 segundos
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Após 5 segundos, verifica o status do perfil
      await refetchProfile();
      
      // Verifica o status do perfil
      if (profile?.status === 'verified') {
        setIsVerified(true);
        toast.success('Conta verificada com sucesso!');
        
        // Redireciona para o dashboard após um pequeno delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError("Código de verificação inválido. Por favor, verifique e tente novamente.");
        toast.error('Falha na verificação', { 
          description: "O código inserido não é válido." 
        });
      }

    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { description: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsVerifying(false);
      setIsWaiting(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setVerificationCode('');
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

          {/* Mensagem de Sucesso */}
          {isVerified && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Conta Verificada!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Redirecionando para o seu painel...
              </p>
            </div>
          )}

          {/* Mensagem de Erro com Botão Tentar Novamente */}
          {error && !isVerified && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Erro na Verificação</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleTryAgain} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          )}

          {/* Formulário de Verificação (padrão) */}
          {!isWaiting && !isVerified && !error && (
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
                  disabled={isResending || countdown > 0 || resendAttempts >= maxResendAttempts}
                  className="flex-1"
                >
                  {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : (countdown > 0 ? <Clock className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />)}
                  {countdown > 0 ? `Aguarde ${countdown}s` : `Reenviar Código (${resendAttempts}/${maxResendAttempts})`}
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