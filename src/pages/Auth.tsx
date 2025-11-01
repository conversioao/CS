import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de login
    setTimeout(() => {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao Conversio Studio",
      });
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de cadastro
    setTimeout(() => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você ganhou 100 créditos gratuitos para começar",
      });
      setIsLoading(false);
      
      const newUser = {
        id: `user_${Date.now()}`,
        name: (e.target as any).elements['signup-name'].value || "Novo Usuário",
        email: "user@example.com", // Mock email
        credits: 100,
        registrationDate: Date.now(),
        plan: 'Free Trial',
      };
      localStorage.setItem('conversio_user', JSON.stringify(newUser));
      localStorage.setItem('isNewUser', 'true'); // Keep this for the onboarding tour

      navigate("/onboarding");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex justify-center mb-6">
            <img src={logo} alt="Conversio Studio" className="h-12 w-auto" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
          <p className="text-muted-foreground">Crie anúncios incríveis com IA</p>
        </div>

        <Card className="backdrop-blur-xl bg-card/50 border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Entre ou crie uma nova conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-whatsapp">Nº de WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-whatsapp"
                        type="tel"
                        placeholder="9XX XXX XXX"
                        className="pl-10"
                        required
                        minLength={9}
                        maxLength={9}
                        pattern="[0-9]{9}"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-whatsapp">Nº de WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-whatsapp"
                        type="tel"
                        placeholder="9XX XXX XXX"
                        className="pl-10"
                        required
                        minLength={9}
                        maxLength={9}
                        pattern="[0-9]{9}"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar conta grátis"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Ao se cadastrar, você ganha 100 créditos gratuitos
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;