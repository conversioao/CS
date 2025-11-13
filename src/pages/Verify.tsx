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
  const [error, setError] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showCheckStatusButton, setShowCheckStatusButton] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

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
    setError(null);

    try {
      const response = await fetch('https://n8n.conversio.ao/webhook-test/verificacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error('Erro ao comunicar com o servidor de verificação.');
      }

      toast.info("Processamento iniciado", {
        description: "Aguarde 5 segundos e depois verifique o status.",
      });

      setTimeout(() => {
        setIsVerifying(false);
        setShowCheckStatusButton(true);
      }, 5000);

    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { description: error.message || 'Ocorreu um erro inesperado.' });
      setIsVerifying(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!user) return;
    setIsCheckingStatus(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetchProfile();
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (data?.status === 'verified') {
        setShowSuccessScreen(true);
        setShowCheckStatusButton(false);
        toast.success("Conta verificada com sucesso!");
      } else {
        setError("Sua conta ainda não foi verificada. Por favor, aguarde mais um pouco ou tente reenviar o código.");
        toast.warning("Verificação pendente", { description: "Aguarde um momento e tente verificar o status novamente." });
      }
    } catch (error: any) {
      setError("Erro ao verificar o status. Tente novamente.");
      toast.error("Erro ao verificar status", { description: error.message });
    } finally {
      setIsCheckingStatus(false);
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
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aguarde 5 segundos...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estamos a processar o seu pedido de verificação.
              </p>
            </div>
          ) : showSuccessScreen ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Conta Verificada!</h3>
              <Button onClick={handleContinue} className="w-full gradient-primary">
                Bem-vindo ao Studio
              </Button>
            </div>
          ) : showCheckStatusButton ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">O processamento foi iniciado. Clique abaixo para verificar o status da sua conta.</p>
              <Button onClick={handleCheckStatus} disabled={isCheckingStatus} className="w-full">
                {isCheckingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Verificar Status
              </Button>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          ) : (
            <>
              {error && (
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
                  <ShieldCheck className="w-4 h-4 mr-2" />
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