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

const Verify = () => {
  const { profile, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationMethod, setVerificationMethod] = useState<'whatsapp' | 'manual'>('whatsapp');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Verificar se o utilizador já está verificado ou se tem uma sessão
  useEffect(() => {
    const checkVerificationStatus = async () => {
      setIsLoading(true);
      if (profile && profile.status === 'verified') {
        // Se já estiver verificado, redirecionar para o dashboard
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
    const whatsappDigits = whatsappNumber.replace(/\D/g, '');
    if (whatsappDigits.length !== 9) {
      toast.error('Número de WhatsApp inválido', { description: 'O número deve conter 9 dígitos (ex: 912345678).' });
      return;
    }

    setIsSendingCode(true);
    try {
      // Em um sistema real, aqui você chamaria uma função edge para enviar o código via WhatsApp API
      // Para este exemplo, vamos simular o envio e gerar um código aleatório
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Armazenar o código temporariamente (em um sistema real, isso seria feito de forma segura no servidor)
      localStorage.setItem(`verification_code_${profile?.id}`, mockCode);
      localStorage.setItem(`verification_code_sent_at_${profile?.id}`, Date.now().toString());

      toast.success(`Código enviado para +244${whatsappNumber}!`);
      setVerificationMethod('whatsapp'); // Muda para a tela de inserção do código
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

      // Verifica se o código está correto e se não expirou (ex: 5 minutos)
      if (storedCode === verificationCode) {
        const now = Date.now();
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (now - parseInt(sentAt) > fiveMinutesInMs) {
          throw new Error("Código expirado. Por favor, solicite um novo.");
        }

        // Se tudo estiver correto, atualiza o status no banco de dados
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'verified' })
          .eq('id', profile?.id);

        if (error) throw error;

        // Limpa o código temporário
        localStorage.removeItem(`verification_code_${profile?.id}`);
        localStorage.removeItem(`verification_code_sent_at_${profile?.id}`);

        await refetchProfile();
        toast.success("Conta verificada com sucesso!");
        
        // Redireciona para o dashboard após um curto delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } else {
        throw new Error("Código de verificação incorreto.");
      }
    } catch (error: any) {
      toast.error("Falha na verificação", { description: error.message });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleManualVerify = async () => {
    if (!profile) return;
    
    setIsVerifyingCode(true);
    try {
      // A verificação manual usa o ID do utilizador como código
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', profile.id);

      if (error) throw error;

      await refetchProfile();
      toast.success("Conta verificada com sucesso!");
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

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
              Para garantir a segurança e acessar todas as funcionalidades, por favor, verifique o seu número.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {verificationMethod === 'whatsapp' && !verificationCode && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Verificação por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Recomendado e mais rápido</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Seu Nº de WhatsApp</Label>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="9XXXXXXXX"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      maxLength={9}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSendCode} 
                  className="w-full" 
                  disabled={isSendingCode || whatsappNumber.length !== 9}
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Código por WhatsApp'
                  )}
                </Button>
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => setVerificationMethod('manual')} className="text-muted-foreground">
                    Verificar manualmente
                  </Button>
                </div>
              </div>
            )}

            {verificationMethod === 'whatsapp' && verificationCode && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Enviamos um código para <span className="font-medium">+244{whatsappNumber}</span></p>
                  <p className="text-xs text-muted-foreground">O código expira em 5 minutos.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Digite o código de 6 dígitos"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleVerifyCode} className="flex-1" disabled={isVerifyingCode || verificationCode.length !== 6}>
                    {isVerifyingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar Código'
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setVerificationCode('');
                    setVerificationMethod('whatsapp');
                  }}>
                    Alterar Nº
                  </Button>
                </div>
                {countdown === 0 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setCountdown(60);
                      handleSendCode();
                    }}>
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
            )}

            {verificationMethod === 'manual' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Key className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Verificação Manual</p>
                    <p className="text-sm text-muted-foreground">Use o seu ID de utilizador como código</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <p className="text-sm mb-2">O seu código de verificação é:</p>
                  <Badge variant="secondary" className="text-lg font-mono p-2">
                    {profile?.id || 'N/A'}
                  </Badge>
                </div>
                <Button onClick={handleManualVerify} className="w-full" disabled={isVerifyingCode}>
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Conta'
                  )}
                </Button>
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => setVerificationMethod('whatsapp')} className="text-muted-foreground">
                    Tentar por WhatsApp
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