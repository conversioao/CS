import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

const Verify = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('pendingUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      toast.error('Sessão expirada', {
        description: 'Por favor, faça o cadastro novamente.',
      });
      navigate('/register');
    }
  }, [navigate]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userId) {
      toast.error('Erro de verificação', {
        description: 'ID de usuário não encontrado. Faça o cadastro novamente.',
      });
      setIsLoading(false);
      navigate('/register');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-user', {
        body: { userId, verificationCode }
      });

      if (error) {
        throw new Error("Ocorreu um erro de comunicação. Tente novamente.");
      }

      if (data.success) {
        toast.success('Conta verificada com sucesso!', {
          description: 'Bem-vindo ao Conversio Studio!',
        });
        
        localStorage.removeItem('pendingUserId');
        localStorage.setItem('userVerified', 'true');
        localStorage.setItem('isNewUser', 'true');
        
        await supabase.auth.refreshSession();

        navigate('/onboarding');
      } else {
        throw new Error(data.error || 'Falha na verificação');
      }
    } catch (error: any) {
      toast.error('Código de Verificação Inválido', {
        description: error.message || 'Por favor, verifique o código e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    toast.info('Código reenviado', {
      description: 'Um novo código foi enviado para o seu WhatsApp. (Use 123456 para testar)',
    });
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex justify-center mb-4">
            <img src={logo} alt="Conversio Studio" className="h-12 w-auto" />
          </Link>
          <CardTitle className="text-2xl">Verifique a sua Conta</CardTitle>
          <CardDescription>Enviámos um código para o seu WhatsApp. Por favor, insira-o abaixo para ativar a sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Código de Verificação</Label>
              <Input 
                id="verificationCode" 
                placeholder="O código é 123456" 
                required 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validar Número'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleResendCode} className="text-sm">
              Não recebeu o código? Reenviar
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Este passo confirma que você é o proprietário do número de WhatsApp.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;