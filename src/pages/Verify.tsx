import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const { user, profile, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.status === 'verified') {
      // Se já estiver verificado, vai direto para o dashboard
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
    if (!user || !profile) {
      toast.error("Não foi possível obter os dados do usuário. Tente novamente.");
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

      // Call the webhook as requested
      await fetch('https://n8n.conversio.ao/webhook-test/leds_whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          full_name: profile.full_name,
          whatsapp_number: profile.whatsapp_number,
          verification_code: newCode,
          created_at: new Date().toISOString(),
        }),
      });

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
        description: "Você será redirecionado para verificar o status.",
      });

      // Redireciona para a página de verificação de status após 5 segundos
      setTimeout(() => {
        navigate('/verification-status');
      }, 5000);

    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { description: error.message || 'Ocorreu um erro inesperado.' });
      setIsVerifying(false);
    }
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
              <h3 className="text-lg font-semibold mb-2">Processando...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estamos a processar o seu pedido de verificação. Você será redirecionado em instantes.
              </p>
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