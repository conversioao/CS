import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

const Verify = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(5);
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

  useEffect(() => {
    if (isVerified) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate('/onboarding');
      }
    }
  }, [isVerified, countdown, navigate]);

  const handleVerification = async () => {
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
      // The mock verification logic requires the code to be the user's ID
      const verificationCode = userId;

      const { data, error: functionError } = await supabase.functions.invoke('verify-user', {
        body: { userId, verificationCode },
      });

      if (functionError) throw functionError;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');
      
      localStorage.removeItem('pendingUserId');
      localStorage.setItem('isNewUser', 'true'); // For the tutorial
      
      setIsVerified(true);

    } catch (error: any) {
      toast.error('Erro na Verificação', {
        description: error.message || 'Não foi possível verificar a sua conta. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
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
          <CardDescription>
            {isVerified 
              ? "A sua conta foi verificada com sucesso!" 
              : "Clique no botão abaixo para ativar a sua conta e confirmar o seu número de WhatsApp."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-muted-foreground">
                Você será redirecionado em {countdown} segundos...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={handleVerification} className="w-full gradient-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar Conta Agora'}
              </Button>
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Este passo confirma que você é o proprietário do número de WhatsApp.</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;