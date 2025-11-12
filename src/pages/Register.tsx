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

  const validateWhatsapp = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 9 digits
    return digits.slice(0, 9);
  };

  const formatWhatsapp = (value: string) => {
    const digits = validateWhatsapp(value);
    if (digits.length === 0) return '';
    
    // Format as XXX XXX XXX
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 3 || i === 6) formatted += ' ';
      formatted += digits[i];
    }
    return formatted;
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

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: formattedWhatsapp,
            account_type: 'user', // Default to user
            ref_code: refCode,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Falha ao criar conta. Tente novamente.');

      localStorage.setItem('isNewUser', 'true');
      
      toast.success('Código de verificação enviado!', {
        description: 'Enviamos o código de verificação para o seu WhatsApp. Em alguns segundos você será redirecionado.',
      });
      
      setTimeout(() => {
        navigate('/onboarding');
      }, 3000);

    } catch (error: any) {
      toast.error('Erro no Cadastro', {
        description: error.message || 'Não foi possível criar a sua conta. Verifique se o número de WhatsApp já não está em uso.',
      });
      setIsLoading(false); // Only stop loading on error
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
                  placeholder="9XX XXX XXX" 
                  required 
                  value={formatWhatsapp(whatsapp)} 
                  onChange={(e) => setWhatsapp(e.target.value)}
                  maxLength={11}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Digite um número de WhatsApp válido com 9 dígitos (ex: 912 345 678)
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