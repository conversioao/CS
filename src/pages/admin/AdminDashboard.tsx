import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity, ArrowUp, BarChart as BarChartIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const monthlyRevenue = [
  { name: 'Jan', revenue: 4000 }, { name: 'Fev', revenue: 3000 },
  { name: 'Mar', revenue: 5000 }, { name: 'Abr', revenue: 4500 },
  { name: 'Mai', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
];

const mostUsedModels = [
  { name: 'Persona', usage: 4500, color: '#8884d8' },
  { name: 'Pulse', usage: 3200, color: '#82ca9d' },
  { name: 'StyleAI', usage: 2800, color: '#ffc658' },
  { name: 'Vision', usage: 1800, color: '#ff8042' },
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
    newUsers24h: 0,
    creditsUsedMonth: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const { data: revenueData } = await supabase.from('payments').select('amount').eq('status', 'approved');
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: newUsersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo);
      const { data: creditsData } = await supabase.from('credit_transactions').select('amount').eq('transaction_type', 'usage').gte('created_at', firstDayOfMonth);
      const { data: transactionsData } = await supabase.from('payments').select('id, amount, status, profiles(full_name)').order('created_at', { ascending: false }).limit(5);

      const totalRevenue = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const creditsUsedMonth = Math.abs(creditsData?.reduce((sum, t) => sum + t.amount, 0) || 0);

      setStats({
        totalRevenue,
        totalUsers: usersCount || 0,
        newUsers24h: newUsersCount || 0,
        creditsUsedMonth,
      });
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Uma visão geral do seu sistema.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Faturação Total</CardTitle><DollarSign className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString('pt-AO')} Kzs</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Usuários</CardTitle><Users className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">+{stats.totalUsers}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Novos Usuários (24h)</CardTitle><ArrowUp className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-3xl font-bold">+{stats.newUsers24h}</div></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Créditos Usados (Mês)</CardTitle><CreditCard className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">{stats.creditsUsedMonth.toLocaleString('pt-AO')}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="bg-card/50 backdrop-blur-xl lg:col-span-3">
          <CardHeader><CardTitle>Visão Geral da Faturação</CardTitle></CardHeader>
          <CardContent className="pl-2"><ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyRevenue}><defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}K`} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" /></AreaChart></ResponsiveContainer></CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl lg:col-span-2">
          <CardHeader><CardTitle>Transações Recentes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell><Badge variant={tx.status === 'approved' ? 'default' : 'secondary'}>{tx.status}</Badge></TableCell>
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