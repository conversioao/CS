import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Upload, CheckCircle, Sparkles, CreditCard, Smartphone, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits_amount: number;
  description: string;
}

interface CreditPurchaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: CreditPackage | null;
  onSuccess: () => void;
}

const CreditPurchaseWizard = ({ isOpen, onClose, selectedPlan, onSuccess }: CreditPurchaseWizardProps) => {
  const { user } = useSession();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: "transferencia", label: "Transferência Bancária", icon: Building2, info: "IBAN: AO06..." },
    { value: "multicaixa", label: "Multicaixa Express", icon: CreditCard, info: "Ref: 987 654 321" },
    { value: "kwik", label: "Kwik", icon: Smartphone, info: "Nº: +244 923 456 789" },
  ];

  const handleNext = () => {
    if (step === 1 && !paymentMethod) {
      toast.error("Selecione um método de pagamento");
      return;
    }
    if (step === 2 && !phoneNumber) {
      toast.error("Insira seu número de telefone");
      return;
    }
    if (step === 3 && !paymentProof) {
      toast.error("Faça upload do comprovante");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!paymentMethod || !paymentProof || !phoneNumber || !selectedPlan || !user) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', paymentProof);
      
      const response = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) throw new Error('Erro ao fazer upload do comprovante');
      const uploadData = await response.json();
      const proofUrl = uploadData.data.url;

      const { data: paymentData, error: paymentError } = await supabase.from('payments').insert({
        user_id: user.id, 
        package_id: selectedPlan.id, 
        amount: selectedPlan.price,
        credits_purchased: selectedPlan.credits_amount, 
        payment_method: paymentMethod,
        proof_url: proofUrl, 
        status: 'pending',
      }).select('id').single();

      if (paymentError || !paymentData) throw paymentError || new Error("Falha ao criar pagamento.");

      const { error: transactionError } = await supabase.from('credit_transactions').insert({
        user_id: user.id, 
        transaction_type: 'purchase', 
        amount: selectedPlan.credits_amount,
        description: `Compra pendente: ${selectedPlan.name}`, 
        related_payment_id: paymentData.id,
      });

      if (transactionError) throw transactionError;

      setStep(4);
      onSuccess();
    } catch (error) {
      toast.error("Erro ao processar pagamento");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setPaymentMethod("");
    setPhoneNumber("");
    setPaymentProof(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetWizard}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Step 1: Selecionar Método */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Escolha o método de pagamento</h2>
                  <p className="text-muted-foreground">Selecione como deseja pagar</p>
                </div>

                <div className="grid gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Card
                        key={method.value}
                        className={`cursor-pointer transition-all duration-300 ${
                          paymentMethod === method.value
                            ? 'border-primary ring-2 ring-primary/50 bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <div className="p-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{method.label}</h3>
                            <p className="text-sm text-muted-foreground">{method.info}</p>
                          </div>
                          {paymentMethod === method.value && (
                            <CheckCircle className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <Button onClick={handleNext} className="w-full gradient-primary" size="lg">
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Informações de Contato */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Informações de contato</h2>
                  <p className="text-muted-foreground">Para confirmarmos o pagamento</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Dados para pagamento:</h3>
                  {paymentMethod === "transferencia" && <p className="text-sm">IBAN: AO06...</p>}
                  {paymentMethod === "multicaixa" && <p className="text-sm">Referência: 987 654 321</p>}
                  {paymentMethod === "kwik" && <p className="text-sm">Número: +244 923 456 789</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Seu Nº de Telefone</Label>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-muted rounded-md text-sm">+244</div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleNext} className="flex-1 gradient-primary">
                    Continuar
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Upload do Comprovante */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Envie o comprovante</h2>
                  <p className="text-muted-foreground">Faça upload da prova de pagamento</p>
                </div>

                <div className="space-y-4">
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="payment-proof">
                    <Card className="cursor-pointer border-2 border-dashed hover:border-primary/50 transition-all">
                      <div className="p-12 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">
                          {paymentProof ? paymentProof.name : 'Clique para fazer upload'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG ou PDF (máx. 5MB)
                        </p>
                      </div>
                    </Card>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 gradient-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    Finalizar Compra
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmação */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in text-center py-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <h2 className="text-3xl font-bold">Pagamento Enviado!</h2>
                <p className="text-muted-foreground">
                  Iremos aprovar o seu pagamento em 15 minutos ou menos, se tudo estiver conforme.
                </p>
                <Button onClick={resetWizard} className="w-full gradient-primary">
                  Concluir
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditPurchaseWizard;