import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Verify = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('verify-user', {
        body: { userId: verificationCode },
      });

      if (error) throw new Error(error.message);

      toast.success('Conta verificada com sucesso!', {
        description: 'Pode agora fazer login.',
      });
      navigate('/login');
    } catch (error: any) {
      toast.error('Código de Verificação Inválido', {
        description: 'Por favor, verifique o código e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <Card className="w-full max-w-md z-10 bg-card/50 backdrop-blur-lg border-border/50">
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
                placeholder="Cole o código aqui" 
                required 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validar Número'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;