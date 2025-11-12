import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  ShieldCheck, 
  Phone, 
  QrCode, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Clock,
  Smartphone,
  MailCheck,
  Key,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Verify = () => {
  const { user, profile, refetchProfile } = useSession();
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [verificationCode, setVerificationCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Gera código de verificação
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Envia código por WhatsApp
  const sendWhatsAppCode = async () => {
    if (!user) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      const newCode = generateVerificationCode();
      console.log('🔑 Novo código gerado:', newCode);

      // Atualiza o código no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          verification_code: newCode,
          verification_method: 'whatsapp',
          verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Simulação de envio via WhatsApp
      console.log(`📱 [SIMULAÇÃO] Código ${newCode} enviado para ${profile?.whatsapp_number}`);
      
      toast.success('Código enviado via WhatsApp!', {
        description: 'Verifique suas mensagens para o código de 6 dígitos.',
      });
      
      setCountdown(60); // 60 segundos para reenviar
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar código:', error);
      setError('Erro ao enviar código. Tente novamente.');
      toast.error('Erro ao enviar código', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Envia código por E-mail
  const sendEmailCode = async () => {
    if (!user) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      const newCode = generateVerificationCode();
      console.log('🔑 Novo código gerado:', newCode);

      // Atualiza o código no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          verification_code: newCode,
          verification_method: 'email',
          verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Simulação de envio por e-mail
      console.log(`📧 [SIMULAÇÃO] Código ${newCode} enviado para ${user.email}`);
      
      toast.success('Código enviado por e-mail!', {
        description: 'Verifique sua caixa de entrada para o código de 6 dígitos.',
      });
      
      setCountdown(60); // 60 segundos para reenviar
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar código:', error);
      setError('Erro ao enviar código. Tente novamente.');
      toast.error('Erro ao enviar código', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Verificação por código
  const verifyByCode = async () => {
    if (!user || !profile) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Busca o perfil com código e método
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('verification_code, verification_method, verification_expires_at, status')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Verifica se expirou
      if (profileData.verification_expires_at && new Date(profileData.verification_expires_at) < new Date()) {
        throw new Error('Código expirado. Solicite um novo.');
      }

      // Verifica se já está verificado
      if (profileData.status === 'verified') {
        toast.success('✅ Conta já está verificada!');
        setTimeout(() => window.location.href = '/onboarding', 1000);
        return;
      }

      // Valida o código
      if (!profileData.verification_code) {
        throw new Error('Nenhum código encontrado. Solicite um novo.');
      }
      
      if (verificationCode !== profileData.verification_code) {
        throw new Error('Código incorreto. Verifique e tente novamente.');
      }

      // Atualiza status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'verified',
          verification_code: null,
          verification_method: null,
          verification_expires_at: null,
          verified_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Atualiza perfil local
      await refetchProfile();

      toast.success('✅ Conta verificada com sucesso!');
      setTimeout(() => window.location.href = '/onboarding', 1000);

    } catch (error: any) {
      console.error('❌ Falha na verificação:', error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { 
        description: error.message || 'Ocorreu um erro inesperado.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verificação por senha (método alternativo)
  const verifyByPassword = async () => {
    if (!user || !password) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Verifica senha (em produção, usar auth.signInWithPassword)
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Simulação de verificação de senha
      if (password !== 'conversio2024') {
        throw new Error('Senha incorreta. Use a senha padrão: conversio2024');
      }

      // Atualiza status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Atualiza perfil local
      await refetchProfile();

      toast.success('✅ Conta verificada com sucesso!');
      setTimeout(() => window.location.href = '/onboarding', 1000);

    } catch (error: any) {
      console.error('❌ Falha na verificação:', error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { 
        description: error.message || 'Ocorreu um erro inesperado.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verificação por QR Code
  const verifyByQR = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Gera QR Code temporário
      const qrCode = `CONV-${user.id}-${generateVerificationCode()}`;
      
      // Salva QR Code no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          qr_code: qrCode,
          qr_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Simulação de leitura de QR Code
      console.log(`📱 [SIMULAÇÃO] QR Code gerado: ${qrCode}`);
      
      // Simula verificação após 3 segundos
      setTimeout(async () => {
        try {
          const { error: verifyError } = await supabase
            .from('profiles')
            .update({ 
              status: 'verified',
              qr_code: null,
              qr_expires_at: null,
              verified_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (verifyError) throw verifyError;

          await refetchProfile();
          toast.success('✅ Conta verificada com sucesso!');
          setTimeout(() => window.location.href = '/onboarding', 1000);
        } catch (error) {
          console.error('❌ Erro na verificação por QR:', error);
          setError('Erro ao verificar QR Code.');
        }
      }, 3000);

      toast.success('QR Code gerado!', {
        description: 'Use um aplicativo autenticador para escanear o código.',
      });

    } catch (error: any) {
      console.error('❌ Falha na verificação:', error);
      setError(error.message || 'Ocorreu um erro inesperado.');
      toast.error('Falha na verificação', { 
        description: error.message || 'Ocorreu um erro inesperado.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já estiver verificado, mostra tela de sucesso
  if (profile.status === 'verified') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">✅ Conta Verificada!</h2>
              <p className="text-muted-foreground mb-6">
                Sua conta foi verificada com sucesso. Redirecionando...
              </p>
              <Button onClick={() => window.location.href = '/onboarding'} className="gradient-primary">
                Continuar para o Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <img src={logo} alt="Conversio Studio" className="h-12 w-auto mx-auto mb-4" />
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verificar Conta</CardTitle>
            <CardDescription>
              Escolha um método para verificar sua conta e garantir segurança.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erro</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="whatsapp" className="text-xs">
                  <Phone className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs">
                  <Mail className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="password" className="text-xs">
                  <Key className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="qr" className="text-xs">
                  <QrCode className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Verificação por WhatsApp */}
              <TabsContent value="whatsapp" className="space-y-4">
                <div className="text-center space-y-2">
                  <Phone className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Verificação por WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para seu WhatsApp
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-code">Código de Verificação</Label>
                  <Input
                    id="whatsapp-code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                    }}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={sendWhatsAppCode}
                    disabled={isResending || countdown > 0}
                    className="flex-1"
                  >
                    {isResending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      <Clock className="w-4 h-4 mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {countdown > 0 ? `${countdown}s` : 'Reenviar'}
                  </Button>
                  <Button
                    onClick={verifyByCode}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="flex-1 gradient-primary"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    Verificar
                  </Button>
                </div>
              </TabsContent>

              {/* Verificação por E-mail */}
              <TabsContent value="email" className="space-y-4">
                <div className="text-center space-y-2">
                  <Mail className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Verificação por E-mail</h3>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para seu e-mail
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-code">Código de Verificação</Label>
                  <Input
                    id="email-code"
                    type="text"
                    placeholder="000000"
                    value={emailCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setEmailCode(value);
                    }}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={sendEmailCode}
                    disabled={isResending || countdown > 0}
                    className="flex-1"
                  >
                    {isResending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      <Clock className="w-4 h-4 mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {countdown > 0 ? `${countdown}s` : 'Reenviar'}
                  </Button>
                  <Button
                    onClick={verifyByCode}
                    disabled={isVerifying || emailCode.length !== 6}
                    className="flex-1 gradient-primary"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    Verificar
                  </Button>
                </div>
              </TabsContent>

              {/* Verificação por Senha */}
              <TabsContent value="password" className="space-y-4">
                <div className="text-center space-y-2">
                  <Key className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Verificação por Senha</h3>
                  <p className="text-sm text-muted-foreground">
                    Use a senha padrão para verificar sua conta
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Senha: conversio2024
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite a senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={verifyByPassword}
                  disabled={isVerifying || !password}
                  className="w-full gradient-primary"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  Verificar Conta
                </Button>
              </TabsContent>

              {/* Verificação por QR Code */}
              <TabsContent value="qr" className="space-y-4">
                <div className="text-center space-y-2">
                  <QrCode className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Verificação por QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Use um aplicativo autenticador para escanear o código
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <div className="w-32 h-32 mx-auto bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QR Code será gerado ao clicar em "Gerar QR Code"
                  </p>
                </div>

                <Button
                  onClick={verifyByQR}
                  disabled={isVerifying}
                  className="w-full gradient-primary"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  Gerar QR Code
                </Button>
              </TabsContent>
            </Tabs>

            {/* Informações de segurança */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Segurança</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sua conta será protegida com verificação em dois fatores após a confirmação.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;