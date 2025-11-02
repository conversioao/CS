import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Upload, Settings, CreditCard, Bot, Palette, Copy, Banknote, History, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import useColorThief from "use-color-thief";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";

const transactions = [
  { id: "TRX001", date: "15/07/2024", description: "Pacote Pro", amount: "49.950 Kzs", status: "Aprovado" },
  { id: "TRX002", date: "10/06/2024", description: "Pacote Starter", amount: "14.950 Kzs", status: "Aprovado" },
  { id: "TRX003", date: "05/05/2024", description: "Pacote Starter", amount: "14.950 Kzs", status: "Aprovado" },
];

const Account = () => {
  const { user, profile, refetchProfile } = useSession();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isVerified = profile?.status === 'verified';

  const { palette } = useColorThief(logoSrc, {
    format: 'hex',
    colorCount: 5,
    quality: 10,
  }) as { palette: string[] | undefined };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!logoSrc) {
      toast.error("Nenhum logotipo carregado", { description: "Por favor, carregue um logotipo primeiro." });
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success("Análise de cores concluída!");
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Cor copiada!", { description: text });
  };

  const handleVerifyAccount = async () => {
    if (!user || !verificationCode.trim()) {
      toast.error("Código necessário", { description: "Por favor, insira o seu código de verificação." });
      return;
    }
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user', {
        body: { userId: user.id, verificationCode }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');
      
      await refetchProfile();

      toast.success("Conta verificada com sucesso!");
    } catch (error: any) {
      toast.error("Erro na verificação", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">Minha Conta</h1>
            <p className="text-muted-foreground text-lg">Gerencie suas informações e preferências</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Perfil</TabsTrigger>
              <TabsTrigger value="brand"><Palette className="w-4 h-4 mr-2" />Marca</TabsTrigger>
              <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Faturação</TabsTrigger>
              <TabsTrigger value="integrations"><Bot className="w-4 h-4 mr-2" />Integrações</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              {!isVerified ? (
                <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30">
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <ShieldAlert className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                    <div>
                      <CardTitle>Verifique a sua conta</CardTitle>
                      <CardDescription>Insira o código recebido no WhatsApp para ativar todas as funcionalidades.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Código de Verificação</Label>
                      <Input 
                        id="verification-code" 
                        placeholder="Insira o código aqui" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleVerifyAccount} disabled={isVerifying} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      Verificar Conta
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                 <Card className="mb-6 bg-green-500/10 border-green-500/30">
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <CardTitle>Conta Verificada</CardTitle>
                      <CardDescription>A sua conta está ativa. Todas as funcionalidades estão disponíveis.</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              )}
              <Card className="bg-card/50 backdrop-blur-xl">
                <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" defaultValue={profile?.full_name || ''} /></div>
                    <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue={user?.email?.split('@')[0] || ''} readOnly /></div>
                  </div>
                  <Button><Settings className="w-4 h-4 mr-2" />Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brand">
              <Card className="bg-card/50 backdrop-blur-xl">
                <CardHeader><CardTitle>Identidade da Marca</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Logotipo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-card/50">
                        {logoSrc ? <img src={logoSrc} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()}>Carregar Logo</Button>
                        <Button onClick={handleAnalyze} disabled={!logoSrc || isAnalyzing}>{isAnalyzing ? "Analisando..." : "Analisar Cores"}</Button>
                        <Input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Paleta de Cores</Label>
                    <div className="space-y-2">
                      {palette ? (
                        palette.map((colorHex, index) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <div className="w-6 h-6 rounded-md border border-border" style={{ backgroundColor: colorHex }} />
                            <span className="font-mono text-sm">{colorHex}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(colorHex)}><Copy className="w-3 h-3" /></Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground pt-2">Analise um logotipo para ver a paleta.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-card/50 backdrop-blur-xl">
                    <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Histórico de Transações</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {transactions.map(t => (
                            <TableRow key={t.id}>
                              <TableCell className="font-mono text-xs">{t.id}</TableCell>
                              <TableCell>{t.date}</TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell className="text-right">{t.amount}</TableCell>
                              <TableCell><Badge className={t.status === "Aprovado" ? "bg-green-500/20 text-green-400" : ""}>{t.status}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="bg-card/50 backdrop-blur-xl">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Créditos</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-primary/10 rounded-lg p-6 text-center"><div className="text-5xl font-bold gradient-text mb-2">{profile?.credits ?? 0}</div><p className="text-sm text-muted-foreground">créditos disponíveis</p></div>
                      <Button className="w-full gradient-primary">Comprar Mais Créditos</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <Card className="bg-card/50 backdrop-blur-xl">
                <CardHeader><CardTitle>Integração com WhatsApp</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Gere imagens diretamente do seu WhatsApp. Este é um recurso exclusivo com uma taxa de subscrição mensal.</p>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">Seu Nº de WhatsApp</Label>
                    <Input id="whatsapp-number" placeholder="9XX XXX XXX" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <div className="font-semibold">Taxa Mensal: 15.000 Kzs</div>
                    <Badge variant="secondary">Status: Inativo</Badge>
                  </div>
                  <Button className="w-full">Ativar Subscrição</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Account;