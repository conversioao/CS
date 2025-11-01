import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Upload, Image, Video, Wand2, Combine, Music, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  { name: "Starter", price: "14.950 Kzs", credits: "100 créditos", features: ["100 créditos de geração", "Imagens em alta resolução", "Suporte básico", "Válido por 30 dias"], popular: false, value: 14950 },
  { name: "Pro", price: "49.950 Kzs", credits: "500 créditos", features: ["500 créditos de geração", "Imagens em alta resolução", "Geração de vídeos", "Suporte prioritário", "Válido por 60 dias"], popular: true, value: 49950 },
  { name: "Studio", price: "124.950 Kzs", credits: "1500 créditos", features: ["1500 créditos de geração", "Todos os recursos Pro", "Acesso a novos recursos", "Suporte VIP 24/7", "Válido por 90 dias"], popular: false, value: 124950 }
];

const transactions = [
  { date: "2024-07-15", description: "Pacote Starter", amount: "14.950 Kzs", credits: "+100", status: "Aprovado" },
  { date: "2024-06-28", description: "Pacote Pro", amount: "49.950 Kzs", credits: "+500", status: "Aprovado" },
  { date: "2024-07-20", description: "Pacote Starter", amount: "14.950 Kzs", credits: "+100", status: "Pendente" },
];

const usageDetails = [
  { tool: "Gerar Imagens", icon: Image, credits: 128 },
  { tool: "Gerar Vídeos", icon: Video, credits: 45 },
  { tool: "Editar Imagem", icon: Wand2, credits: 22 },
  { tool: "Combinar Imagens", icon: Combine, credits: 15 },
  { tool: "Gerar Músicas", icon: Music, credits: 50 },
];

const Credits = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePurchase = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPaymentProof(file);
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod || !paymentProof || !phoneNumber) {
      toast({ title: "Campos necessários", description: "Preencha todos os campos para continuar.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', paymentProof);
      const uploadResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Erro ao fazer upload do comprovante');
      const uploadData = await uploadResponse.json();
      const proofUrl = uploadData.data.url;
      await fetch('https://n8n.conversio.ao/webhook-test/pagamento-creditos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_name: selectedPlan?.name, plan_price: selectedPlan?.value, credits: selectedPlan?.credits, payment_method: paymentMethod, phone_number: phoneNumber, proof_url: proofUrl, status: 'pending', created_at: new Date().toISOString() }) });
      toast({ title: "Pagamento enviado!", description: "Seu pagamento está pendente de aprovação." });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível processar o pagamento.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] bg-dot-pattern opacity-20" />
          <div className="text-center mb-12"><h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Pacotes de Créditos</h1><p className="text-muted-foreground text-lg">Escolha o pacote ideal para suas necessidades criativas</p></div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-secondary/20 border rounded-xl p-8 ${plan.popular ? "border-primary" : "border-border"}`}>
                {plan.popular && <Badge className="absolute top-4 right-4 bg-primary">Mais Popular</Badge>}
                <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="w-8 h-8 text-primary" /></div></div>
                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                <div className="text-center mb-2"><span className="text-4xl font-bold gradient-text">{plan.price}</span></div>
                <p className="text-center text-muted-foreground mb-6">{plan.credits}</p>
                <ul className="space-y-3 mb-8">{plan.features.map((feature, i) => (<li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span className="text-sm">{feature}</span></li>))}</ul>
                <Button className={`w-full ${plan.popular ? "gradient-primary" : ""}`} variant={plan.popular ? "default" : "outline"} size="lg" onClick={() => handlePurchase(plan)}>Adquirir Créditos</Button>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Histórico de Transações</CardTitle></CardHeader><CardContent><div className="space-y-4">{transactions.map((t, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"><div className="flex flex-col"><p className="font-semibold">{t.description}</p><p className="text-xs text-muted-foreground">{t.date} - {t.amount}</p></div><div className="text-right"><Badge variant={t.status === "Aprovado" ? "default" : "secondary"} className={t.status === "Aprovado" ? "bg-green-500/20 text-green-400" : ""}>{t.status}</Badge><p className={`text-sm font-bold ${t.credits.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{t.credits}</p></div></div>))}</div></CardContent></Card>
            <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Detalhes de Uso</CardTitle></CardHeader><CardContent><div className="space-y-3">{usageDetails.map((u, i) => { const Icon = u.icon; return (<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"><div className="flex items-center gap-3"><Icon className="w-5 h-5 text-muted-foreground" /><p className="font-semibold">{u.tool}</p></div><p className="font-bold">{u.credits} <span className="text-xs text-muted-foreground">créditos</span></p></div>);})}</div></CardContent></Card>
          </div>
        </main>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Finalizar Compra - {selectedPlan?.name}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="bg-primary/10 rounded-lg p-4 space-y-1"><p className="text-sm text-muted-foreground">Pacote:</p><p className="text-lg font-bold">{selectedPlan?.name}</p><p className="text-2xl font-bold gradient-text">{selectedPlan?.price}</p></div><div className="space-y-2"><Label htmlFor="payment-method">Método de Pagamento</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger id="payment-method"><SelectValue placeholder="Selecione o método" /></SelectTrigger><SelectContent><SelectItem value="transferencia">Transferência Bancária</SelectItem><SelectItem value="multicaixa">Multicaixa Express</SelectItem><SelectItem value="kwik">Kwik</SelectItem></SelectContent></Select></div>{paymentMethod && (<div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1"><p className="font-semibold">Dados para pagamento:</p>{paymentMethod === "transferencia" && <p>IBAN: AO06...</p>}{paymentMethod === "multicaixa" && <p>Ref: 987 654 321</p>}{paymentMethod === "kwik" && <p>Nº: +244 923 456 789</p>}</div>)}<div className="space-y-2"><Label htmlFor="phone">Nº de Telefone</Label><Input id="phone" type="tel" placeholder="+244 9XX XXX XXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="payment-proof">Comprovante</Label><Input id="payment-proof" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /><label htmlFor="payment-proof"><Button variant="outline" className="w-full justify-start gap-2" asChild><span><Upload className="w-4 h-4" />{paymentProof ? paymentProof.name : 'Fazer upload'}</span></Button></label></div><Button className="w-full" onClick={handleSubmitPayment} disabled={isSubmitting}>{isSubmitting ? "A enviar..." : "Enviar Pagamento"}</Button><p className="text-xs text-muted-foreground text-center">O seu pagamento será aprovado em breve.</p></div></DialogContent></Dialog>
    </div>
  );
};

export default Credits;