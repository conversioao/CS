import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Starter",
    price: "14.950 Kzs",
    credits: "100 créditos",
    features: [
      "100 créditos de geração",
      "Imagens em alta resolução",
      "Suporte básico",
      "Válido por 30 dias"
    ],
    popular: false,
    value: 14950
  },
  {
    name: "Pro",
    price: "49.950 Kzs",
    credits: "500 créditos",
    features: [
      "500 créditos de geração",
      "Imagens em alta resolução",
      "Geração de vídeos",
      "Suporte prioritário",
      "Válido por 60 dias"
    ],
    popular: true,
    value: 49950
  },
  {
    name: "Studio",
    price: "124.950 Kzs",
    credits: "1500 créditos",
    features: [
      "1500 créditos de geração",
      "Todos os recursos Pro",
      "Acesso a novos recursos",
      "Suporte VIP 24/7",
      "Válido por 90 dias"
    ],
    popular: false,
    value: 124950
  }
];

const howItWorks = [
  "Cada geração de imagem consome 1 crédito",
  "Vídeos curtos consomem 5 créditos",
  "Gerações 3D consomem 3 créditos",
  "Créditos não utilizados expiram após o período de validade",
  "Você pode acumular créditos comprando múltiplos pacotes"
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
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Método de pagamento necessário",
        description: "Por favor, selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (!paymentProof) {
      toast({
        title: "Comprovante necessário",
        description: "Por favor, faça upload do comprovante de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Telefone necessário",
        description: "Por favor, informe seu número de telefone",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload do comprovante para o ImgBB
      const formData = new FormData();
      formData.append('image', paymentProof);

      const uploadResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload do comprovante');
      }

      const uploadData = await uploadResponse.json();
      const proofUrl = uploadData.data.url;

      // Enviar dados para o webhook
      const response = await fetch('https://n8n.conversio.ao/webhook-test/pagamento-creditos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_name: selectedPlan?.name,
          plan_price: selectedPlan?.value,
          credits: selectedPlan?.credits,
          payment_method: paymentMethod,
          phone_number: phoneNumber,
          proof_url: proofUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar solicitação de pagamento');
      }

      toast({
        title: "Pagamento enviado!",
        description: "Seu pagamento está pendente de aprovação. Você será notificado em breve.",
      });

      setIsDialogOpen(false);
      setPaymentMethod("");
      setPaymentProof(null);
      setPhoneNumber("");
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Pacotes de Créditos
            </h1>
            <p className="text-muted-foreground text-lg">
              Escolha o pacote ideal para suas necessidades criativas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-secondary/20 border rounded-xl p-8 ${
                  plan.popular ? "border-primary" : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                </div>
                <p className="text-center text-muted-foreground mb-6">{plan.credits}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    plan.popular ? "gradient-primary" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePurchase(plan)}
                >
                  Adquirir Créditos
                </Button>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-secondary/20 border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Como funcionam os créditos?</h2>
            <ul className="space-y-3">
              {howItWorks.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Compra - {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Pacote selecionado:</p>
              <p className="text-lg font-bold">{selectedPlan?.name}</p>
              <p className="text-2xl font-bold gradient-text">{selectedPlan?.price}</p>
              <p className="text-sm text-muted-foreground">{selectedPlan?.credits}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="multicaixa">Multicaixa Express</SelectItem>
                  <SelectItem value="kwik">Kwik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-sm">Dados para pagamento:</p>
                {paymentMethod === "transferencia" && (
                  <div className="text-sm space-y-1">
                    <p>Banco: BAI</p>
                    <p>IBAN: AO06.0006.0000.1234.5678.1011.2</p>
                    <p>Titular: Conversio Studio</p>
                  </div>
                )}
                {paymentMethod === "multicaixa" && (
                  <div className="text-sm space-y-1">
                    <p>Entidade: 11224</p>
                    <p>Referência: 987 654 321</p>
                  </div>
                )}
                {paymentMethod === "kwik" && (
                  <div className="text-sm space-y-1">
                    <p>Número Kwik: +244 923 456 789</p>
                    <p>Nome: Conversio Studio</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+244 900 000 000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-proof">Comprovante de Pagamento</Label>
              <Input
                id="payment-proof"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="payment-proof">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    {paymentProof ? paymentProof.name : 'Fazer upload do comprovante'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, PDF
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Pagamento"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Seu pagamento ficará pendente até ser aprovado por nossa equipe. 
              Você receberá uma notificação quando for aprovado.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Credits;