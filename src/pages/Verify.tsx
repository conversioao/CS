import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Verify = () => {
  const { user, profile, refetchProfile } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    console.log(`📍 Avançando para etapa ${currentStep + 1}`);
    setCurrentStep(currentStep + 1);
    setError(null);
  };

  const handleResendCode = async () => {
    if (!user) return;
    
    setError(null);
    console.log('🔄 Reenviando código de verificação...');
    
    try {
      // Gera um novo código de 6 dígitos
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔑 Novo código gerado:', newCode);

      // Atualiza o código no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_code: newCode })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar código:', updateError);
        throw updateError;
      }

      console.log('✅ Código atualizado no banco de dados');
      toast.success('Novo código enviado!', {
        description: 'Verifique seu WhatsApp para o novo código.',
      });

    } catch (error: any) {
      console.error('❌ Erro ao reenviar código:', error);
      setError('Erro ao reenviar código. Tente novamente.');
      toast.error('Erro ao reenviar código', {
        description: 'Tente novamente em alguns instantes.',
      });
    }
  };

  const handleVerify = async () => {
    console.log('🔍 Iniciando verificação...');
    
    // Validações iniciais
    if (!user || !profile) {
      const errorMsg = "Sessão não encontrada. Por favor, faça login novamente.";
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      const errorMsg = "Por favor, insira o código de 6 dígitos.";
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setError(null);
    console.log('📝 Código digitado:', verificationCode);

    try {
      // Buscar o perfil e o código de verificação
      console.log('📡 Buscando perfil do usuário...');
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('verification_code, status')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar perfil:', fetchError);
        throw new Error(`Erro ao buscar seus dados: ${fetchError.message}`);
      }

      console.log('✅ Perfil encontrado. Código salvo:', profileData.verification_code);
      console.log('📋 Status atual:', profileData.status);

      // Verifica se já está verificado
      if (profileData.status === 'verified') {
        console.log('✅ Usuário já está verificado!');
        toast.success('✅ Conta já está verificada!');
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 1000);
        return;
      }

      // Compara os códigos
      console.log('🔍 Comparando códigos...');
      if (!profileData.verification_code) {
        throw new Error('Nenhum código de verificação encontrado. Por favor, solicite um novo código.');
      }
      
      if (verificationCode !== profileData.verification_code) {
        console.warn('⚠️ Código incorreto');
        throw new Error('Código incorreto. Verifique e tente novamente.');
      }

      console.log('✅ Código correto! Atualizando status...');

      // Atualiza o status para 'verified' e remove o código
      console.log('📡 Atualizando status do usuário...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'verified',
          verification_code: null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        throw new Error(`Erro ao atualizar seu status: ${updateError.message}`);
      }

      console.log('✅ Status atualizado com sucesso!');
      
      // Recarrega o perfil
      console.log('🔄 Recarregando perfil...');
      await refetchProfile();

      console.log('🎉 Verificação concluída com sucesso!');
      toast.success('✅ Conta verificada com sucesso!');
      
      // Atualiza a página para o ProtectedRoute detectar a mudança
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 1000);

    } catch (error: any) {
      console.error('❌ Falha na verificação:', error);
      setError(error.message || 'Ocorreu um erro inesperado ao verificar sua conta.');
      toast.error('Falha na verificação', { 
        description: error.message || 'Ocorreu um erro inesperado.' 
      });
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
                {currentStep === 1 && <Mail className="w-8 h-8 text-primary" />}
                {currentStep === 2 && <ShieldCheck className="w-8 h-8 text-primary" />}
                {currentStep === 3 && <ShieldCheck className="w-8 h-8 text-primary" />}
              </div>
            </div>
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Código Enviado'}
              {currentStep === 2 && 'Digite o Código'}
              {currentStep === 3 && 'Verificar Conta'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enviamos um código de verificação para o seu WhatsApp.'}
              {currentStep === 2 && 'Insira o código de 6 dígitos que você recebeu.'}
              {currentStep === 3 && 'Confirme o código para ativar sua conta.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Indicador de progresso */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep ? 'w-12 bg-primary' : 'w-8 bg-muted'
                  }`}
                />
              ))}
            </div>

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

            {/* Etapa 1: Informação */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm">
                    Enviamos um código de <strong>6 dígitos</strong> para:
                  </p>
                  <Badge variant="secondary" className="mt-2 text-base">
                    {profile?.whatsapp_number || 'Seu WhatsApp'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Verifique suas mensagens e prepare-se para inserir o código.
                </p>
                <Button onClick={handleNextStep} className="w-full gradient-primary">
                  Avançar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa 2: Inserir código */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
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
                    className="text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Digite os 6 dígitos recebidos no WhatsApp
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 gradient-primary"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 3: Confirmar e verificar */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Código inserido:</p>
                  <Badge variant="secondary" className="text-2xl font-mono tracking-widest px-6 py-2">
                    {verificationCode}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleVerify}
                    className="flex-1 gradient-primary"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verificar Conta
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