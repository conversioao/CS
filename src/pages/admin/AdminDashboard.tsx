import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, ArrowUp, ArrowDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const monthlyRevenue = [
  { name: 'Jan', revenue: 4000 }, { name: 'Fev', revenue: 3000 },
  { name: 'Mar', revenue: 5000 }, { name: 'Abr', revenue: 4500 },
  { name: 'Mai', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 }, { name: 'Ago', revenue: 6500 },
  { name: 'Set', revenue: 7200 }, { name: 'Out', revenue: 8000 },
  { name: 'Nov', revenue: 7800 }, { name: 'Dez', revenue: 9000 },
];

interface RecentTransaction {
  id: string;
  amount: number;
  status: string;
  profiles: { full_name: string } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    pendingPayments: 0,
    revenueChange: 2.5, // Mock data
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const { data: revenueData } = await supabase.from('payments').select('amount').eq('status', 'approved');
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { data: transactionsData } = await supabase.from('payments').select('id, amount, status, profiles(full_name)').order('created_at', { ascending: false }).limit(5);

      const totalRevenue = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats(prev => ({
        ...prev,
        totalRevenue,
        totalUsers: usersCount || 0,
        pendingPayments: pendingCount || 0,
      }));
      setRecentTransactions(transactionsData as any);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 text-white p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-purple-200">Uma visão geral e atualizada da sua plataforma.</p>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Faturação Total</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString('pt-AO')} Kzs</div><p className="text-xs text-muted-foreground flex items-center gap-1">{stats.revenueChange > 0 ? <ArrowUp className="w-4 h-4 text-green-500" /> : <ArrowDown className="w-4 h-4 text-red-500" />} {stats.revenueChange}% em relação ao mês passado</p></CardContent></Card>
        <Card className="bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">+{stats.totalUsers}</div><p className="text-xs text-muted-foreground">+10 no último mês</p></CardContent></Card>
        <Card className="bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.pendingPayments}</div><p className="text-xs text-muted-foreground">Aguardando aprovação</p></CardContent></Card>
        <Card className="bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">12.5%</div><p className="text-xs text-muted-foreground">+2.1% em relação à semana passada</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card lg:col-span-2">
          <CardHeader><CardTitle>Estatísticas de Faturação</CardTitle></CardHeader>
          <CardContent className="pl-2"><ResponsiveContainer width="100%" height={350}><LineChart data={monthlyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}K`} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></CardContent>
        </Card>
        
        <Card className="bg-card lg:col-span-2">
          <CardHeader><CardTitle>Transações Recentes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell><Badge variant={tx.status === 'approved' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>{tx.status}</Badge></TableCell>
                    <TableCell className="text-right">{tx.amount.toLocaleString('pt-AO')} Kzs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;