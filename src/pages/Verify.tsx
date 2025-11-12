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
    if (!profile || !whatsappNumber) {
      toast.error('Perfil ou número de WhatsApp não encontrado.');
      return;
    }

    setIsSendingCode(true);
    try {
      // 1. Gerar um código de 6 dígitos aleatório
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Definir a data de expiração (5 minutos a partir de agora)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // 3. Inserir o código na tabela do banco de dados
      const { error } = await supabase
        .from('user_verification_codes')
        .insert({
          user_id: profile.id,
          code: code,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // Em um sistema real, aqui você chamaria uma função edge para enviar o código via WhatsApp API
      // Por enquanto, apenas mostramos o código no console para fins de desenvolvimento
      console.log(`Código de verificação para ${profile.id}: ${code}`);

      toast.success(`Código enviado para +244${whatsappNumber}! Verifique suas mensagens.`);
      setStep('entering_code');
    } catch (error: any) {
      console.error('Erro ao enviar código:', error);
      toast.error("Erro ao enviar código. Tente novamente.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !profile) {
      toast.error("Por favor, insira a sua API Key.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      // 1. Buscar o código na tabela, verificando se ele existe, pertence ao usuário e não expirou
      const { data: codeData, error: fetchError } = await supabase
        .from('user_verification_codes')
        .select('*')
        .eq('user_id', profile.id)
        .eq('code', verificationCode)
        .gt('expires_at', new Date().toISOString())
        .single(); // .single() garante que apenas um registro seja retornado ou um erro seja lançado

      if (fetchError || !codeData) {
        throw new Error("API Key inválida ou expirada. Tente novamente.");
      }

      // 2. Se o código for válido, marcar o perfil como verificado
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // 3. Deletar o código de verificação usado da tabela
      await supabase
        .from('user_verification_codes')
        .delete()
        .eq('id', codeData.id);

      // 4. Atualizar o estado local do perfil
      await refetchProfile();

      toast.success("Conta verificada com sucesso!");
      setTimeout(() => navigate('/dashboard'), 1500);

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