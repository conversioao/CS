import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Users, DollarSign, MousePointerClick, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Commission {
  id: string;
  user: string;
  amount: number;
  status: string;
  date: string;
}

const AffiliateDashboard = () => {
  const { profile } = useSession();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({ clicks: 0, signups: 0, conversions: 0 });
  const [earnings, setEarnings] = useState({ pending: 0, paid: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setReferralCode(profile.referral_code || '');
      fetchAffiliateData(profile.id);
    }
  }, [profile]);

  const fetchAffiliateData = async (userId: string) => {
    setLoading(true);
    
    const { data: commissionsData, error: commissionsError } = await supabase
      .from('commissions')
      .select(`
        id,
        commission_amount,
        status,
        created_at,
        profiles:referred_user_id (
          full_name
        )
      `)
      .eq('affiliate_id', userId);

    if (commissionsError) {
      toast.error("Erro ao buscar comissões.");
    } else {
      const formattedCommissions = commissionsData.map((c: any) => ({
        id: c.id,
        user: c.profiles?.full_name || 'Usuário Removido',
        amount: c.commission_amount,
        status: c.status === 'paid' ? 'Paga' : 'Pendente',
        date: new Date(c.created_at).toLocaleDateString('pt-AO'),
      }));
      setCommissions(formattedCommissions);

      const pending = commissionsData.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0);
      const paid = commissionsData.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0);
      setEarnings({ pending, paid });
      setStats(prev => ({ ...prev, conversions: commissionsData?.length || 0 }));
    }

    const { error: referredUsersError, count: signupsCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', userId);

    if (!referredUsersError) {
      setStats(prev => ({ ...prev, signups: signupsCount || 0 }));
    }

    setStats(prev => ({ ...prev, clicks: 152 })); // Placeholder para cliques

    setLoading(false);
  };

  const referralLink = `https://conversio.studio/register?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link de referência copiado!");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Painel de Afiliado</h1><p className="text-muted-foreground">Acompanhe as suas referências e ganhos.</p></div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader><CardTitle>Seu Link de Referência</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2"><Input value={referralLink} readOnly className="bg-background/50" /><Button onClick={copyLink}><Copy className="w-4 h-4 mr-2" />Copiar</Button></CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cliques</CardTitle><MousePointerClick className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.clicks}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cadastros</CardTitle><Users className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.signups}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ganhos Pendentes</CardTitle><DollarSign className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{earnings.pending.toLocaleString('pt-AO')} Kzs</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Pago</CardTitle><DollarSign className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{earnings.paid.toLocaleString('pt-AO')} Kzs</div></CardContent></Card>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle>Histórico de Comissões</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Usuário Indicado</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader><TableBody>{commissions.map(c => (<TableRow key={c.id}><TableCell className="font-mono text-xs">{c.id}</TableCell><TableCell>{c.user}</TableCell><TableCell>{c.amount.toLocaleString('pt-AO')} Kzs</TableCell><TableCell>{c.status}</TableCell><TableCell>{c.date}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};

export default AffiliateDashboard;