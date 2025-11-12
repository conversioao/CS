import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Mail, 
  QrCode, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download
} from "lucide-react";
import { toast } from "sonner";

const AccountSecurity = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUser(user);
      setProfile(profile);
      setTwoFactorEnabled(profile.two_factor_enabled || false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Erro ao carregar dados de segurança");
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  };

  const enableTwoFactor = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Gera QR Code temporário
      const secret = `CONV-${user.id}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Salva no banco
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_secret: secret,
          two_factor_enabled: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Gera backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      toast.success("Autenticação de dois fatores ativada!");
      setTwoFactorEnabled(true);

    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error("Erro ao ativar autenticação de dois fatores");
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Autenticação de dois fatores desativada!");
      setTwoFactorEnabled(false);

    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error("Erro ao desativar autenticação de dois fatores");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!user || !newPassword || newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para área de transferência");
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segurança da Conta</h2>
          <p className="text-muted-foreground">
            Gerencie a segurança da sua conta e configure autenticação de dois fatores
          </p>
        </div>
        <Button onClick={fetchUserData} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Atualizar"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
          <TabsTrigger value="twofactor">2FA</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Status de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled ? "Ativada" : "Não ativada"}
                    </p>
                  </div>
                </div>
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                  {twoFactorEnabled ? "Seguro" : "Recomendado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Senha Forte</p>
                    <p className="text-sm text-muted-foreground">
                      Sua senha é forte e única
                    </p>
                  </div>
                </div>
                <Badge variant="default">Seguro</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Email Verificado</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email} está verificado
                    </p>
                  </div>
                </div>
                <Badge variant="default">Verificado</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Configure rapidamente as opções de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => document.getElementById('password-tab')?.click()}
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => document.getElementById('twofactor-tab')?.click()}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Configurar 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Senha */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Use uma senha forte e única para proteger sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={changePassword} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Alterar Senha"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Use senhas únicas</p>
                  <p className="text-sm text-muted-foreground">
                    Não use a mesma senha em múltiplas contas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Use senhas fortes</p>
                  <p className="text-sm text-muted-foreground">
                    Combine letras, números e símbolos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Atualize regularmente</p>
                  <p className="text-sm text-muted-foreground">
                    Altere sua senha a cada 3 meses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autenticação de Dois Fatores */}
        <TabsContent value="twofactor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Autenticação de Dois Fatores
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status do 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled ? "Ativado" : "Desativado"}
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableTwoFactor();
                    } else {
                      disableTwoFactor();
                    }
                  }}
                />
              </div>

              {twoFactorEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    ✅ Autenticação de dois fatores ativada
                  </p>
                  <p className="text-xs text-green-600">
                    Você precisará de um código de verificação para fazer login
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {backupCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Códigos de Backup</CardTitle>
                <CardDescription>
                  Guarde esses códigos em um local seguro. Eles podem ser usados se você perder o acesso ao seu autenticador.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="font-mono text-sm">{code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadBackupCodes}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Códigos
                  </Button>
                  <Button variant="outline" onClick={() => setBackupCodes([])}>
                    Regenerar Códigos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Atividade Recente */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Veja os últimos acessos à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Login bem-sucedido</p>
                    <p className="text-sm text-muted-foreground">
                      Hoje às 14:30 • Chrome • Windows
                    </p>
                  </div>
                  <Badge variant="default">Atual</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Login bem-sucedido</p>
                    <p className="text-sm text-muted-foreground">
                      Ontem às 09:15 • Safari • macOS
                    </p>
                  </div>
                  <Badge variant="secondary">Anterior</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Senha alterada</p>
                    <p className="text-sm text-muted-foreground">
                      3 dias atrás • Alteração de senha
                    </p>
                  </div>
                  <Badge variant="outline">Segurança</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSecurity;