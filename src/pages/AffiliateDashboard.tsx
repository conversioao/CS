import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Users, DollarSign, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

// Mock data - será substituído por dados reais do Supabase
const affiliateData = {
  referralCode: "CONV123XYZ",
  stats: {
    clicks: 152,
    signups: 34,
    conversions: 12,
  },
  earnings: {
    pending: 15000,
    paid: 45000,
  },
  commissions: [
    { id: "C001", user: "Maria Costa", amount: 2500, status: "Paga", date: "18/07/2024" },
    { id: "C002", user: "João Silva", amount: 5000, status: "Pendente", date: "20/07/2024" },
  ],
};

const AffiliateDashboard = () => {
  const referralLink = `https://conversio.studio/register?ref=${affiliateData.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link de referência copiado!");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Painel de Afiliado</h1><p className="text-muted-foreground">Acompanhe as suas referências e ganhos.</p></div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader><CardTitle>Seu Link de Referência</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2"><Input value={referralLink} readOnly className="bg-background/50" /><Button onClick={copyLink}><Copy className="w-4 h-4 mr-2" />Copiar</Button></CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cliques</CardTitle><MousePointerClick className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{affiliateData.stats.clicks}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cadastros</CardTitle><Users className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{affiliateData.stats.signups}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ganhos Pendentes</CardTitle><DollarSign className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{affiliateData.earnings.pending.toLocaleString('pt-AO')} Kzs</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Pago</CardTitle><DollarSign className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{affiliateData.earnings.paid.toLocaleString('pt-AO')} Kzs</div></CardContent></Card>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle>Histórico de Comissões</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Usuário Indicado</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader><TableBody>{affiliateData.commissions.map(c => (<TableRow key={c.id}><TableCell>{c.id}</TableCell><TableCell>{c.user}</TableCell><TableCell>{c.amount.toLocaleString('pt-AO')} Kzs</TableCell><TableCell>{c.status}</TableCell><TableCell>{c.date}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};

export default AffiliateDashboard;