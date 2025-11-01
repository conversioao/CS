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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedWhatsapp = `+244${whatsapp.replace(/\s/g, '')}`;
    const dummyEmail = `${formattedWhatsapp}@conversio.studio`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: formattedWhatsapp,
            user_type: userType,
            account_type: accountType,
            ref_code: refCode,
          },
        },
      });
      if (error) throw error;

      toast.info('Cadastro realizado!', {
        description: 'Enviámos um código para o seu WhatsApp. Insira-o para ativar a sua conta.',
      });
      navigate('/verify');

    } catch (error: any) {
      toast.error('Erro no Cadastro', {
        description: error.message || 'Não foi possível criar a sua conta. Tente novamente.',
      });
    } finally {
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
            <div className="space-y-2"><Label htmlFor="fullName">Nome Completo</Label><Input id="fullName" placeholder="Seu nome completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="whatsapp">Nº de WhatsApp</Label><div className="flex items-center gap-2"><div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div><Input id="whatsapp" type="tel" placeholder="9XX XXX XXX" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></div></div>
            <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" placeholder="Pelo menos 6 caracteres" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="userType">Eu sou</Label><Select required onValueChange={setUserType}><SelectTrigger id="userType"><SelectValue placeholder="Selecione o seu perfil..." /></SelectTrigger><SelectContent><SelectItem value="designer">Designer</SelectItem><SelectItem value="empreendedor">Empreendedor</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Tipo de Conta</Label><RadioGroup defaultValue="user" onValueChange={setAccountType} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="user" id="r1" /><Label htmlFor="r1">Usuário</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="affiliate" id="r2" /><Label htmlFor="r2">Afiliado</Label></div></RadioGroup></div>
            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta Grátis'}</Button>
          </form>
          <div className="mt-4 text-center text-sm">Já tem uma conta?{' '}<Link to="/login" className="underline text-primary">Entre</Link></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;