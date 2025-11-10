import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, Bot, Palette, Banknote, History, ShieldAlert, ShieldCheck, Loader2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const transactions = [
  { id: "TRX001", date: "15/07/2024", description: "Pacote Pro", amount: "49.950 Kzs", status: "Aprovado" },
  { id: "TRX002", date: "10/06/2024", description: "Pacote Starter", amount: "14.950 Kzs", status: "Aprovado" },
];

interface ToolCost {
  id: string;
  display_name: string;
}

const Account = () => {
  const { user, profile, refetchProfile } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isCodeSentModalOpen, setIsCodeSentModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [tools, setTools] = useState<ToolCost[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [userVerificationCode, setUserVerificationCode] = useState('');

  const isProfileVerified = profile?.status === 'verified';
  const defaultTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: subData } = await supabase.from('whatsapp_subscriptions').select('*').eq('user_id', user.id).single();
        setSubscription(subData);
        
        const { data: toolsData } = await supabase.from('tool_costs').select('id, display_name').eq('is_active', true);
        setTools(toolsData || []);
      }
    };
    fetchData();
  }, [user]);

  const handleVerifyAccount = async () => {
    if (!user || !verificationCode) {
      toast.error("Código de verificação é obrigatório.");
      return;
    }
    setIsVerifying(true);
    try {
      // A lógica de verificação é que o código deve ser o ID do usuário
      // Esta é uma simulação para o processo de verificação via WhatsApp
      const { data, error } = await supabase.functions.invoke('verify-user', {
        body: { userId: user.id, verificationCode },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na verificação');

      toast.success("Conta verificada com sucesso!");
      await refetchProfile(); // Re-fetch profile to update status
    } catch (error: any) {
      toast.error("Erro na verificação", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleActivateSubscription = async () => {
    if (!user || !whatsappNumber.match(/^(9[1-5]|99)\d{7}$/) || !selectedToolId) {
      toast.error("Dados inválidos", { description: "Por favor, preencha o número de WhatsApp e selecione uma ferramenta." });
      return;
    }
    setIsActivating(true);
    try {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expires_at = new Date();
      expires_at.setMonth(expires_at.getMonth() + 1);

      const { data, error } = await supabase.from('whatsapp_subscriptions').insert({
        user_id: user.id,
        whatsapp_number: `+244${whatsappNumber}`,
        associated_tool_id: selectedToolId,
        verification_code: randomCode,
        status: 'pending_verification',
        expires_at: expires_at.toISOString(),
      }).select().single();

      if (error) throw error;
      
      setSubscription(data);
      setIsCodeSentModalOpen(true);
      toast.success("Código enviado!", { description: `O seu código de verificação é ${randomCode} (simulação).` });
    } catch (error: any) {
      toast.error("Erro ao ativar", { description: error.message });
    } finally {
      setIsActivating(false);
    }
  };

  const handleVerifyWhatsapp = async () => {
    if (!subscription || !userVerificationCode) return;
    setIsVerifying(true);
    try {
      if (subscription.verification_code !== userVerificationCode) {
        throw new Error("Código de verificação incorreto.");
      }
      const { data, error } = await supabase.from('whatsapp_subscriptions').update({ status: 'verified', verification_code: null }).eq('id', subscription.id).select().single();
      if (error) throw error;
      setSubscription(data);
      toast.success("WhatsApp verificado com sucesso!");
    } catch (error: any) {
      toast.error("Erro na verificação", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const getToolName = (toolId: string) => tools.find(t => t.id === toolId)?.display_name || 'Ferramenta desconhecida';

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mb-8"><h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">Minha Conta</h1><p className="text-muted-foreground text-lg">Gerencie suas informações e preferências</p></div>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6"><TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Perfil</TabsTrigger><TabsTrigger value="brand"><Palette className="w-4 h-4 mr-2" />Marca</TabsTrigger><TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Faturação</TabsTrigger><TabsTrigger value="integrations"><Bot className="w-4 h-4 mr-2" />Integrações</TabsTrigger></TabsList>
            <TabsContent value="profile">
              {!isProfileVerified ? (
                <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30"><CardHeader className="flex-row items-center gap-4 space-y-0"><ShieldAlert className="w-8 h-8 text-yellow-600 flex-shrink-0" /><div><CardTitle>Verifique a sua conta</CardTitle><CardDescription>Insira o código recebido no WhatsApp para ativar todas as funcionalidades.</CardDescription></div></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="verification-code">Código de Verificação</Label><Input id="verification-code" placeholder="Insira o código aqui" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} /></div><Button onClick={handleVerifyAccount} disabled={isVerifying} className="bg-yellow-500 hover:bg-yellow-600 text-black">{isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}Verificar Conta</Button></CardContent></Card>
              ) : (
                 <Card className="mb-6 bg-green-500/10 border-green-500/30"><CardHeader className="flex-row items-center gap-4 space-y-0"><ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" /><div><CardTitle>Conta Verificada</CardTitle><CardDescription>A sua conta está ativa. Todas as funcionalidades estão disponíveis.</CardDescription></div></CardHeader></Card>
              )}
              <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" defaultValue={profile?.full_name || ''} /></div><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue={user?.email?.split('@')[0] || ''} readOnly /></div></div><Button><Settings className="w-4 h-4 mr-2" />Salvar Alterações</Button></CardContent></Card>
            </TabsContent>
            <TabsContent value="brand">{/* ... Brand content ... */}</TabsContent>
            <TabsContent value="billing">{/* ... Billing content ... */}</TabsContent>
            <TabsContent value="integrations">
              <Card className="bg-card/50 backdrop-blur-xl">
                <CardHeader><CardTitle>Integração com WhatsApp</CardTitle><CardDescription>Associe uma ferramenta ao seu WhatsApp para geração rápida.</CardDescription></CardHeader>
                <CardContent>
                  {!subscription ? (
                    <div className="space-y-4">
                      <div className="space-y-2"><Label htmlFor="whatsapp-number">Seu Nº de WhatsApp</Label><div className="flex items-center gap-2"><div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div><Input id="whatsapp-number" placeholder="9XX XXX XXX" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} /></div></div>
                      <div className="space-y-2"><Label htmlFor="tool-select">Ferramenta a Associar</Label><Select onValueChange={setSelectedToolId}><SelectTrigger id="tool-select"><SelectValue placeholder="Selecione uma ferramenta..." /></SelectTrigger><SelectContent>{tools.map(tool => <SelectItem key={tool.id} value={tool.id}>{tool.display_name}</SelectItem>)}</SelectContent></Select></div>
                      <Button className="w-full" onClick={handleActivateSubscription} disabled={isActivating}>{isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-2" />Ativar Integração</>}</Button>
                    </div>
                  ) : subscription.status === 'pending_verification' ? (
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground">Enviámos um código de verificação para o seu WhatsApp. Por favor, insira-o abaixo.</p>
                      <div className="space-y-2"><Label htmlFor="whatsapp-code">Código de Verificação</Label><Input id="whatsapp-code" placeholder="Código de 6 caracteres" value={userVerificationCode} onChange={(e) => setUserVerificationCode(e.target.value)} /></div>
                      <Button className="w-full" onClick={handleVerifyWhatsapp} disabled={isVerifying}>{isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar Número"}</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <h3 className="font-bold">Integração Ativa</h3>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><strong>Nº WhatsApp:</strong> {subscription.whatsapp_number}</p>
                        <p><strong>Ferramenta Associada:</strong> {getToolName(subscription.associated_tool_id)}</p>
                        <p><strong>Expira em:</strong> {new Date(subscription.expires_at).toLocaleDateString('pt-AO')}</p>
                      </div>
                      <Button variant="destructive" className="w-full">Desativar Integração</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Dialog open={isCodeSentModalOpen} onOpenChange={setIsCodeSentModalOpen}><DialogContent className="sm:max-w-md text-center"><DialogHeader><DialogTitle>Código Enviado!</DialogTitle><DialogDescription>Enviámos um código de verificação para o seu WhatsApp. Por favor, insira-o na página para completar a ativação.</DialogDescription></DialogHeader></DialogContent></Dialog>
    </div>
  );
};

export default Account;