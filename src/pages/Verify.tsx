import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const { user, profile, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginRedirect, setShowLoginRedirect] = useState(false);

  useEffect(() => {
    if (profile?.status === 'verified') {
      // Se já estiver verificado, vai direto para o dashboard
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleVerify = async () => {
    if (!user || verificationCode.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    setIsVerifying(true);
    setError(null);

    try {
      // Enviar todas as informações para o novo webhook
      const webhookResponse = await fetch('https://n8n.conversio.ao/webhook-test/verificacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          full_name: profile.full_name,
          whatsapp_number: profile.whatsapp_number,
          verification_code: verificationCode,
          created_at: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Erro ao enviar dados para o webhook de verificação');
      }

      // Mostrar mensagem de sucesso
      toast.success("Solicitação de verificação enviada com sucesso!");
      // Mostrar tela de redirecionamento
      setShowLoginRedirect(true);
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
            Insira o código de verificação que foi enviado para o seu WhatsApp.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {showLoginRedirect ? (
            <div className="flex flex-col items-center justify-center py-8">
              <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Solicitação enviada!</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Sua solicitação de verificação foi enviada com sucesso. Por favor, faça login para verificar se sua conta foi ativada.
              </p>
              <Button onClick={() => navigate('/login')}
                className="gradient-primary"
              >
                Fazer Login
              </Button>
            </div>
          ) : isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enviando solicitação...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Estamos processando sua solicitação de verificação.
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
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1 gradient-primary"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verificar Conta
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center pt-2">
                O código foi enviado para o seu WhatsApp. Ele é válido por 60 segundos.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;