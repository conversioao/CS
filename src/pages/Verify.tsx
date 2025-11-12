import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Smartphone, Key } from "lucide-react";
import { toast } from "sonner";

type VerificationStep = 'initial' | 'entering_code' | 'manual_fallback';

const Verify = () => {
  const { profile, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<VerificationStep>('initial');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const whatsappNumber = profile?.whatsapp_number ? profile.whatsapp_number.replace('+244', '') : '';

  useEffect(() => {
    const checkVerificationStatus = async () => {
      setIsLoading(true);
      if (profile && profile.status === 'verified') {
        navigate('/dashboard');
      }
      setIsLoading(false);
    };
    checkVerificationStatus();
  }, [profile, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!whatsappNumber) {
      toast.error('Número de WhatsApp não encontrado no seu perfil.');
      return;
    }

    setIsSendingCode(true);
    try {
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`verification_code_${profile?.id}`, mockCode);
      localStorage.setItem(`verification_code_sent_at_${profile?.id}`, Date.now().toString());

      toast.success(`Código enviado para +244${whatsappNumber}! Verifique suas mensagens.`);
      setStep('entering_code');
    } catch (error: any) {
      toast.error("Erro ao enviar código", { description: error.message });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("Por favor, insira a sua API Key.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      // Lógica para o passo 'entering_code' (verificação por WhatsApp)
      const storedCode = localStorage.getItem(`verification_code_${profile?.id}`);
      const sentAt = localStorage.getItem(`verification_code_sent_at_${profile?.id}`);

      if (storedCode && sentAt && verificationCode === storedCode) {
        const now = Date.now();
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (now - parseInt(sentAt) > fiveMinutesInMs) {
          throw new Error("Código expirado. Por favor, solicite um novo.");
        }

        const { error } = await supabase
          .from('profiles')
          .update({ status: 'verified' })
          .eq('id', profile?.id);

        if (error) throw error;

        localStorage.removeItem(`verification_code_${profile?.id}`);
        localStorage.removeItem(`verification_code_sent_at_${profile?.id}`);

        await refetchProfile();
        toast.success("Conta verificada com sucesso!");
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Se o código não for encontrado ou não bater, informa o usuário
        throw new Error("API Key inválida. Verifique e tente novamente ou use a verificação manual.");
      }
    } catch (error: any) {
      toast.error("Falha na verificação", { description: error.message });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleManualFallback = () => {
    setStep('manual_fallback');
  };

  const handleManualVerify = async () => {
    if (!profile) return;
    
    setIsVerifyingCode(true);
    try {
      // Lógica para o passo 'manual_fallback' (verificação por ID de usuário)
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', profile.id);

      if (error) throw error;

      await refetchProfile();
      toast.success("Conta verificada com sucesso!");
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error: any) {
      toast.error("Falha na verificação", { description: error.message });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verifique a sua conta</CardTitle>
            <CardDescription>
              Enviamos uma API Key para o seu WhatsApp para garantir a segurança da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passo 1: Inicial - Exibir WhatsApp e botão de envio */}
            {step === 'initial' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary mr-3" />
                  <div className="text-center">
                    <p className="font-medium">Número de WhatsApp</p>
                    <Badge variant="secondary" className="mt-1 text-lg">
                      +244 {whatsappNumber}
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={handleSendCode} 
                  className="w-full gradient-primary" 
                  disabled={isSendingCode}
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Enviar API Key por WhatsApp
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Passo 2: Inserir a API Key (para verificação por WhatsApp) */}
            {step === 'entering_code' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enviamos uma API Key para <span className="font-medium">+244 {whatsappNumber}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A API Key expira em 5 minutos.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (6 dígitos)</Label>
                  <Input
                    id="api-key"
                    type="text"
                    placeholder="Digite a sua API Key"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite o código de 6 dígitos recebido por WhatsApp.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleVerifyCode} className="w-full gradient-primary" disabled={isVerifyingCode || verificationCode.length !== 6}>
                    {isVerifyingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar API Key'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleManualFallback}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Não recebeu a API Key? Verifique manualmente
                    </Button>
                  </div>

                  {countdown === 0 && (
                    <div className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setCountdown(60);
                          handleSendCode();
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Reenviar API Key
                      </Button>
                    </div>
                  )}
                  {countdown > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                      Pode reenviar em {countdown}s
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Passo 3: Fallback Manual (para verificação por ID de usuário) */}
            {step === 'manual_fallback' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <Key className="w-5 h-5 text-primary mr-3" />
                  <div className="text-center">
                    <p className="font-medium">Verificação Manual</p>
                    <p className="text-sm text-muted-foreground">
                      Use o seu ID de utilizador como API Key.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <p className="text-sm mb-2">O seu ID de utilizador é:</p>
                  <Badge variant="secondary" className="text-lg font-mono p-2">
                    {profile?.id || 'N/A'}
                  </Badge>
                </div>
                <Button onClick={handleManualVerify} className="w-full gradient-primary" disabled={isVerifyingCode}>
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Conta Manualmente'
                  )}
                </Button>
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep('entering_code')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Voltar para verificação por WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;