import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Key } from "lucide-react";
import { toast } from "sonner";

const Verify = () => {
  const { profile, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const lastSixLetters = profile?.id ? profile.id.slice(-6) : '';
  const maskedId = profile?.id ? `${profile.id.slice(0, -6)}******` : 'N/A';

  const handleVerify = async () => {
    if (!profile || !verificationCode) {
      toast.error("Por favor, insira o código de verificação.");
      return;
    }

    setIsVerifying(true);
    try {
      if (verificationCode !== lastSixLetters) {
        throw new Error("Código de verificação incorreto. Tente novamente.");
      }

      const { error } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Conta verificada com sucesso! Redirecionando...");
      
      // Atualiza o perfil no contexto
      await refetchProfile();

      // Força um reload da página para que o ProtectedRoute leia o novo status
      window.location.reload();

    } catch (error: any) {
      toast.error("Falha na verificação", { description: error.message });
      setIsVerifying(false); // Garante que o botão seja reativado em caso de erro
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verifique a sua conta</CardTitle>
            <CardDescription>
              Para garantir a segurança da sua conta, por favor, verifique o seu ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
              <Key className="w-5 h-5 text-primary mr-3" />
              <div className="text-center">
                <p className="font-medium">Seu ID de Usuário</p>
                <Badge variant="secondary" className="mt-1 text-lg font-mono">
                  {maskedId}
                </Badge>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800">
                Para verificar sua conta, digite as <strong>6 últimas letras</strong> do seu ID.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Exemplo: <Badge variant="outline" className="text-amber-800 border-amber-300">{lastSixLetters}</Badge>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de Verificação</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Digite as 6 últimas letras do seu ID"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Digite exatamente 6 letras (números e letras são permitidos).
              </p>
            </div>

            <Button 
              onClick={handleVerify} 
              className="w-full gradient-primary" 
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                'Verificar Conta'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;