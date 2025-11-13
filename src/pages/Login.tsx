import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedWhatsapp = `+244${whatsapp.replace(/\s/g, '')}`;
    const dummyEmail = `${formattedWhatsapp}@conversio.studio`;

    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
      if (error) throw error;

      if (loginData.user) {
        // Check user profile for account type and status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_type, status')
          .eq('id', loginData.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error("Error fetching profile:", profileError);
          navigate('/verify'); // Redireciona para verificação se houver erro
          return;
        }

        // Se for admin, vai para o admin dashboard
        if (profile?.account_type === 'admin') {
          navigate('/admin');
        } 
        // Se for usuário e já estiver verificado, vai para o dashboard
        else if (profile?.status === 'verified') {
          // Verifica se é o primeiro login após verificação
          const isFirstLogin = localStorage.getItem('firstLoginAfterVerification') === 'true';
          if (isFirstLogin) {
            setShowWelcomeMessage(true);
            localStorage.removeItem('firstLoginAfterVerification');
            
            // Redireciona após mostrar a mensagem
            setTimeout(() => {
              navigate('/dashboard');
            }, 5000);
          } else {
            navigate('/dashboard');
          }
        }
        // Se for usuário e NÃO estiver verificado, vai para a página de verificação
        else {
          navigate('/verify');
        }
      }

    } catch (error: any) {
      toast.error('Erro no Login', {
        description: 'Número de WhatsApp ou senha incorretos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quando a página carrega, verifica se precisamos mostrar a mensagem de boas-vindas
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === 'true') {
      setShowWelcomeMessage(true);
      // Remove o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (showWelcomeMessage) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-lg border-border/50">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Conta Verificada com Sucesso!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Parabéns! Sua conta foi verificada e você recebeu <strong>100 créditos grátis</strong> para começar.
              </p>
              <p className="text-muted-foreground">
                Agora você pode utilizar todos os recursos do Conversio Studio.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">
                Você será redirecionado para o painel em instantes...
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
          <CardDescription>Entre na sua conta para continuar a criar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nº de WhatsApp</Label>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div>
                <Input id="whatsapp" type="tel" placeholder="9XX XXX XXX" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="underline text-primary">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;