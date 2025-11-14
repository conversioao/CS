import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappDigits = whatsapp.replace(/\D/g, '');
    if (whatsappDigits.length !== 9) {
      toast.error('Número de WhatsApp inválido', {
        description: 'O número deve conter exatamente 9 dígitos.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não coincidem', {
        description: 'As senhas digitadas não são iguais.',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Senha muito curta', {
        description: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    const formattedWhatsapp = `+244${whatsappDigits}`;
    const dummyEmail = `${formattedWhatsapp}@conversio.studio`;
    const verificationCode = generateVerificationCode();

    console.log('🔐 Iniciando cadastro...');
    console.log('📱 WhatsApp:', formattedWhatsapp);
    console.log('🔑 Código de verificação gerado:', verificationCode);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: formattedWhatsapp,
            account_type: 'user',
            ref_code: refCode,
            verification_code: verificationCode,
          },
        },
      });

      if (signUpError) {
        console.error('❌ Erro no signup:', signUpError);
        throw signUpError;
      }
      if (!signUpData.user) {
        console.error('❌ Usuário não foi criado');
        throw new Error('Falha ao criar conta. Tente novamente.');
      }

      console.log('✅ Usuário criado com sucesso:', signUpData.user.id);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_code: verificationCode })
        .eq('id', signUpData.user.id);

      if (updateError) {
        console.error('❌ Erro ao salvar código de verificação:', updateError);
        throw updateError;
      }

      console.log('✅ Código de verificação salvo no banco de dados');
      
      // Enviar dados para o webhook
      try {
        console.log('📤 Enviando dados para o webhook...');
        const webhookResponse = await fetch('https://n8n.conversio.ao/webhook-test/leds_whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: signUpData.user.id,
            full_name: fullName,
            whatsapp_number: formattedWhatsapp,
            verification_code: verificationCode,
            ref_code: refCode,
            created_at: new Date().toISOString(),
          }),
        });

        if (webhookResponse.ok) {
          console.log('✅ Dados enviados para o webhook com sucesso');
        } else {
          console.warn('⚠️ Webhook retornou erro, mas continuando o processo');
        }
      } catch (webhookError) {
        console.error('❌ Erro ao enviar para webhook:', webhookError);
        // Não bloqueia o cadastro se o webhook falhar
      }

      toast.success('Conta criada com sucesso! Por favor, verifique a sua conta.');
      navigate('/verify');

    } catch (error: any) {
      console.error('❌ Erro geral no cadastro:', error);
      toast.error('Erro no Cadastro', {
        description: error.message || 'Não foi possível criar a sua conta. Verifique se o número de WhatsApp já não está em uso.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex justify-center mb-4">
            <img src={logo} alt="Conversio Studio" className="h-12 w-auto" />
          </Link>
          <CardTitle className="text-2xl">Crie a sua conta</CardTitle>
          <CardDescription>Comece a sua jornada criativa com IA gratuitamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input 
                id="fullName" 
                placeholder="Seu nome completo" 
                required 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nº de WhatsApp</Label>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div>
                <Input 
                  id="whatsapp" 
                  type="tel" 
                  placeholder="9XXXXXXXX" 
                  required 
                  value={whatsapp} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setWhatsapp(value);
                  }}
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Digite um número de WhatsApp válido com 9 dígitos (ex: 912345678)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Pelo menos 6 caracteres" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Repita a senha" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando Conta...
                </>
              ) : (
                'Criar Conta Grátis'
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Ao criar a conta, você concorda com nossos{' '}
              <Link to="/terms" className="underline text-primary">Termos de Serviço</Link>
              {' '}e{' '}
              <Link to="/privacy" className="underline text-primary">Política de Privacidade</Link>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="underline text-primary">Entre</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;