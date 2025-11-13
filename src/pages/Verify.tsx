import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Verifica se a página foi recarregada após a verificação
  useEffect(() => {
    const verificationTriggered = localStorage.getItem('verificationTriggered');
    if (verificationTriggered === 'true') {
      localStorage.removeItem('verificationTriggered');
      // Força uma atualização do perfil após o reload
      refetchProfile().then(() => {
        // Aguarda um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          if (profile?.status === 'verified') {
            setIsVerified(true);
            setShowSuccessScreen(true);
          } else {
            setError("A verificação ainda está pendente. Por favor, tente novamente.");
          }
        }, 1000);
      });
    }
  }, [profile, refetchProfile]);

  useEffect(() => {
    if (profile?.status === 'verified' && !showSuccessScreen) {
      navigate('/dashboard');
    }
  }, [profile, navigate, showSuccessScreen]);

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

      // Marca que a verificação foi acionada
      localStorage.setItem('verificationTriggered', 'true');
      
      // Aguarda 5 segundos e depois recarrega a página
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { description: error.message || 'Ocorreu um erro inesperado.' });
      setIsVerifying(false);
      setIsWaiting(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (sessionLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o status já estiver verificado e não estamos mostrando a tela de sucesso, redireciona
  if (profile.status === 'verified' && !showSuccessScreen) {
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

          {/* Tela de Sucesso após reload */}
          {showSuccessScreen && isVerified && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Conta Verificada!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Sua conta foi verificada com sucesso.
              </p>
              <Button onClick={handleContinue} className="w-full gradient-primary">
                Continuar para o Painel
              </Button>
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && !showSuccessScreen && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Erro na Verificação</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de Verificação (padrão) */}
          {!isWaiting && !showSuccessScreen && !error && (
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