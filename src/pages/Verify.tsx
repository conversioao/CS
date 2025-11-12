import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Smartphone, Key } from "lucide-react";
import { toast } from "sonner";

// Define os tipos para o passo atual
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

  // Extrai o número de WhatsApp do perfil
  const whatsappNumber = profile?.whatsapp_number ? profile.whatsapp_number.replace('+244', '') : '';

  // Verificar se o utilizador já está verificado
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

  // Lógica de countdown para reenvio de código
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
      // Em um sistema real, aqui você chamaria uma função edge para enviar o código via WhatsApp API
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Armazenar o código temporariamente
      localStorage.setItem(`verification_code_${profile?.id}`, mockCode);
      localStorage.setItem(`verification_code_sent_at_${profile?.id}`, Date.now().toString());

      toast.success(`Código enviado para +244${whatsappNumber}! Verifique suas mensagens.`);
      setStep('entering_code'); // Avança para o passo de inserção do código
    } catch (error: any) {
      toast.error("Erro ao enviar código", { description: error.message });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Por favor, insira o código de 6 dígitos.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const storedCode = localStorage.getItem(`verification_code_${profile?.id}`);
      const sentAt = localStorage.getItem(`verification_code_sent_at_${profile?.id}`);

      if (!storedCode || !sentAt) {
        throw new Error("Código não encontrado. Por favor, solicite um novo.");
      }

      if (storedCode === verificationCode) {
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
        throw new Error("Código de verificação incorreto.");
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
              Enviamos um código para o seu WhatsApp para garantir a segurança da sua conta.
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
                      Enviar Código por WhatsApp
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Passo 2: Inserir o Código */}
            {step === 'entering_code' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para <span className="font-medium">+244 {whatsappNumber}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O código expira em 5 minutos.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Digite o código"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleVerifyCode} className="w-full gradient-primary" disabled={isVerifyingCode || verificationCode.length !== 6}>
                    {isVerifyingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar Código'
                    )}
                  </Button>
                  
                  {/* Link para fallback manual */}
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleManualFallback}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Não recebeu o código? Verifique manualmente
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
                        Reenviar Código
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

            {/* Passo 3: Fallback Manual */}
            {step === 'manual_fallback' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <Key className="w-5 h-5 text-primary mr-3" />
                  <div className="text-center">
                    <p className="font-medium">Verificação Manual</p>
                    <p className="text-sm text-muted-foreground">
                      Use o seu ID de utilizador como código de verificação.
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