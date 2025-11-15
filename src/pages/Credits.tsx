import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2, ArrowUp, ArrowDown, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";
import CreditPurchaseWizard from "@/components/CreditPurchaseWizard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits_amount: number;
  description: string;
  is_active: boolean;
}

interface Transaction {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  transaction_type: string;
  payments: { status: 'pending' | 'approved' | 'rejected' } | null;
}

const Credits = () => {
  const { user } = useSession();
  const [plans, setPlans] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CreditPackage | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const fetchPlans = supabase.from('credit_packages').select('*').eq('is_active', true).order('price', { ascending: true });
    const fetchTransactions = supabase.from('credit_transactions').select('*, payments(status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);

    const [plansResult, transactionsResult] = await Promise.all([fetchPlans, fetchTransactions]);

    if (plansResult.error) toast.error("Erro ao carregar pacotes de créditos.");
    else setPlans(plansResult.data);

    if (transactionsResult.error) toast.error("Erro ao carregar histórico de transações.");
    else setTransactions(transactionsResult.data as any);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]); // Only re-run when user changes

  const handlePurchase = (plan: CreditPackage) => {
    setSelectedPlan(plan);
    setIsPurchaseModalOpen(true);
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'welcome') return <Gift className="w-5 h-5 text-green-400" />;
    if (amount > 0) return <ArrowUp className="w-5 h-5 text-green-400" />;
    return <ArrowDown className="w-5 h-5 text-red-400" />;
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block"><DashboardSidebar /></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute inset-0 pointer-events-none z-[-1] bg-dot-pattern opacity-20" />
            
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Pacotes de Créditos</h1>
              <p className="text-muted-foreground text-lg">Escolha o pacote ideal para as suas necessidades criativas</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="bg-card/50 backdrop-blur-xl border-border/50 flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <p className="text-muted-foreground">{plan.credits_amount} créditos</p>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="text-center mb-6">
                          <span className="text-4xl font-bold gradient-text">{plan.price.toLocaleString('pt-AO')}</span>
                          <span className="text-sm text-muted-foreground"> Kzs</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          {(plan.description || '').split(',').map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-auto gradient-primary" size="lg" onClick={() => handlePurchase(plan)}>
                          Adquirir Créditos
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Card className="bg-card/50 backdrop-blur-xl">
                  <CardHeader><CardTitle>Histórico de Transações</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.length > 0 ? (
                          transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                                  {getTransactionIcon(t.transaction_type, t.amount)}
                                </div>
                                <div>
                                  <p className="font-semibold">{t.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(t.created_at).toLocaleString('pt-AO')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn("font-bold", t.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                                </p>
                                {t.payments && (
                                  <Badge
                                    variant={t.payments.status === "approved" ? "default" : "secondary"}
                                    className={cn(
                                      t.payments.status === "approved" && "bg-green-500/20 text-green-400",
                                      t.payments.status === "rejected" && "bg-red-500/20 text-red-400"
                                    )}
                                  >
                                    {t.payments.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhuma transação encontrada.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      <CreditPurchaseWizard
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        selectedPlan={selectedPlan}
        onSuccess={fetchData}
      />
    </>
  );
};

export default Credits;