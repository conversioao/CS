import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, Bot, Palette, Copy, Banknote, History, ShieldAlert, ShieldCheck, Loader2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const transactions = [
  { id: "TRX001", date: "15/07/2024", description: "Pacote Pro", amount: "49.950 Kzs", status: "Aprovado" },
  { id: "TRX002", date: "10/06/2024", description: "Pacote Starter", amount: "14.950 Kzs", status: "Aprovado" },
];

const Account = () => {
  const { user, profile, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  const isVerified = profile?.status === 'verified';
  const subscriptionCost = 15000;

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const { data } = await supabase
          .from('whatsapp_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setSubscription(data);
      }
    };
    fetchSubscription();
  }, [user]);

  const handleVerifyAccount = async () => {
    if (!user || !verificationCode.trim()) {
      toast.error("Código necessário", { description: "Por favor, insira o seu código de verificação." });
      return;
    }
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user', { body: { userId: user.id, verificationCode } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');
      await refetchProfile();
      toast.success("Conta verificada com sucesso!", { description: "A redirecionar para o seu painel..." });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error("Erro na verificação", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleActivateSubscription = async () => {
    if (!profile || !user) return;
    if (profile.credits < subscriptionCost) {
      toast.error("Créditos insuficientes", { description: `Você precisa de ${subscriptionCost} créditos. Por favor, compre mais.` });
      return;
    }
    if (!whatsappNumber.match(/^(9[1-5]|99)\d{7}$/)) {
      toast.error("Número inválido", { description: "Por favor, insira um número de WhatsApp válido (9XX XXX XXX)." });
      return;
    }

    setIsSubscribing(true);
    try {
      const { error: creditError } = await supabase.from('profiles').update({ credits: profile.credits - subscriptionCost }).eq('id', user.id);
      if (creditError) throw creditError;

      const { error: subError } = await supabase.from('whatsapp_subscriptions').insert({ user_id: user.id, whatsapp_number: `+244${whatsappNumber}` });
      if (subError) {
        // Reembolsar créditos em caso de falha
        await supabase.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
        throw subError;
      }

      await refetchProfile();
      setSubscription({ status: 'pending_approval' });
      setIsSubscriptionModalOpen(false);
      toast.success("Solicitação enviada!", { description: "A sua subscrição está pendente de aprovação pelo administrador." });
    } catch (error: any) {
      toast.error("Erro ao ativar", { description: error.message });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mb-8"><h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">Minha Conta</h1><p className="text-muted-foreground text-lg">Gerencie suas informações e preferências</p></div>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6"><TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Perfil</TabsTrigger><TabsTrigger value="brand"><Palette className="w-4 h-4 mr-2" />Marca</TabsTrigger><TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Faturação</TabsTrigger><TabsTrigger value="integrations"><Bot className="w-4 h-4 mr-2" />Integrações</TabsTrigger></TabsList>
            <TabsContent value="profile">
              {!isVerified ? (
                <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30"><CardHeader className="flex-row items-center gap-4 space-y-0"><ShieldAlert className="w-8 h-8 text-yellow-600 flex-shrink-0" /><div><CardTitle>Verifique a sua conta</CardTitle><CardDescription>Insira o código recebido no WhatsApp para ativar todas as funcionalidades.</CardDescription></div></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="verification-code">Código de Verificação</Label><Input id="verification-code" placeholder="Insira o código aqui" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} /></div><Button onClick={handleVerifyAccount} disabled={isVerifying} className="bg-yellow-500 hover:bg-yellow-600 text-black">{isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}Verificar Conta</Button></CardContent></Card>
              ) : (
                 <Card className="mb-6 bg-green-500/10 border-green-500/30"><CardHeader className="flex-row items-center gap-4 space-y-0"><ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" /><div><CardTitle>Conta Verificada</CardTitle><CardDescription>A sua conta está ativa. Todas as funcionalidades estão disponíveis.</CardDescription></div></CardHeader></Card>
              )}
              <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" defaultValue={profile?.full_name || ''} /></div><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue={user?.email?.split('@')[0] || ''} readOnly /></div></div><Button><Settings className="w-4 h-4 mr-2" />Salvar Alterações</Button></CardContent></Card>
            </TabsContent>
            <TabsContent value="brand">{/* ... Brand content ... */}</TabsContent>
            <TabsContent value="billing"><div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Histórico de Transações</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{transactions.map(t => (<TableRow key={t.id}><TableCell className="font-mono text-xs">{t.id}</TableCell><TableCell>{t.date}</TableCell><TableCell>{t.description}</TableCell><TableCell className="text-right">{t.amount}</TableCell><TableCell><Badge className={t.status === "Aprovado" ? "bg-green-500/20 text-green-400" : ""}>{t.status}</Badge></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></div><div><Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Créditos</CardTitle></CardHeader><CardContent className="space-y-4"><div className="bg-primary/10 rounded-lg p-6 text-center"><div className="text-5xl font-bold gradient-text mb-2">{profile?.credits ?? 0}</div><p className="text-sm text-muted-foreground">créditos disponíveis</p></div><Button className="w-full gradient-primary">Comprar Mais Créditos</Button></CardContent></Card></div></div></TabsContent>
            <TabsContent value="integrations">
              <Card className="bg-card/50 backdrop-blur-xl">
                <CardHeader><CardTitle>Integração com WhatsApp</CardTitle><CardDescription>Gere imagens diretamente do seu WhatsApp. Este é um recurso exclusivo com uma taxa de subscrição mensal.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <div className="font-semibold">Taxa Mensal: {subscriptionCost.toLocaleString('pt-AO')} créditos</div>
                    {subscription?.status === 'active' && <Badge className="bg-green-500/20 text-green-400">Status: Ativo</Badge>}
                    {subscription?.status === 'pending_approval' && <Badge className="bg-yellow-500/20 text-yellow-400">Status: Pendente</Badge>}
                    {!subscription && <Badge variant="secondary">Status: Inativo</Badge>}
                  </div>
                  {!subscription && <Button className="w-full" onClick={() => setIsSubscriptionModalOpen(true)}><Zap className="w-4 h-4 mr-2" />Ativar Subscrição</Button>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <DialogContent><DialogHeader><DialogTitle>Ativar Integração WhatsApp</DialogTitle><DialogDescription>Confirme para usar {subscriptionCost.toLocaleString('pt-AO')} dos seus créditos e ativar a subscrição mensal.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="whatsapp-number">Seu Nº de WhatsApp</Label><div className="flex items-center gap-2"><div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div><Input id="whatsapp-number" placeholder="9XX XXX XXX" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} /></div></div>
            <div className="text-sm text-muted-foreground">O seu saldo atual é de <strong className="text-foreground">{profile?.credits.toLocaleString('pt-AO')} créditos</strong>. Após a ativação, restará <strong className="text-foreground">{(profile?.credits - subscriptionCost).toLocaleString('pt-AO')} créditos</strong>.</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>Cancelar</Button><Button onClick={handleActivateSubscription} disabled={isSubscribing}>{isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar e Ativar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;