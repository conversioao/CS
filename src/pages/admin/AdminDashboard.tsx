import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity, ArrowUp, Image, Clock, BarChart as BarChartIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [mostUsedModels, setMostUsedModels] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalImages: 0,
    pendingPayments: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved');

    if (!revenueError && revenueData) {
      const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);
      setStats(prev => ({ ...prev, totalRevenue }));
    }

    // Fetch total users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (!userError) {
      setStats(prev => ({ ...prev, totalUsers: userCount || 0 }));
    }

    // Fetch total images (from image_history)
    const { data: imageData, error: imageError } = await supabase
      .from('image_history')
      .select('id', { count: 'exact', head: true });

    if (!imageError) {
      setStats(prev => ({ ...prev, totalImages: imageData?.length || 0 }));
    }

    // Fetch pending payments
    const { data: pendingPayments, error: pendingError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'pending');

    if (!pendingError && pendingPayments) {
      const pendingCount = pendingPayments.length;
      const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setStats(prev => ({ ...prev, pendingPayments: pendingCount, pendingAmount }));
    }

    // Fetch monthly revenue data
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('payments')
      .select('created_at, amount')
      .eq('status', 'approved');

    if (!monthlyError && monthlyData) {
      const revenueByMonth = {};
      monthlyData.forEach(payment => {
        const month = new Date(payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + payment.amount;
      });
      
      const formattedMonthlyData = Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue }));
      setMonthlyRevenue(formattedMonthlyData);
    }

    // Fetch user growth data
    const { data: userData, error: userGrowthError } = await supabase
      .from('profiles')
      .select('created_at');

    if (!userGrowthError && userData) {
      const userByMonth = {};
      userData.forEach(user => {
        const month = new Date(user.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        userByMonth[month] = (userByMonth[month] || 0) + 1;
      });
      
      const formattedUserData = Object.entries(userByMonth).map(([name, users]) => ({ name, users }));
      setUserGrowth(formattedUserData);
    }

    // Fetch most used models
    const { data: modelUsage, error: modelError } = await supabase
      .from('image_history')
      .select('model');

    if (!modelError && modelUsage) {
      const modelCounts = {};
      modelUsage.forEach(item => {
        const model = item.model || 'Unknown';
        modelCounts[model] = (modelCounts[model] || 0) + 1;
      });
      
      const formattedModelData = Object.entries(modelCounts)
        .map(([name, usage]) => ({ name, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 4);
      
      setMostUsedModels(formattedModelData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Uma visão geral do seu sistema.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturação Total</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString('pt-AO')} Kzs</div>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> +20.1%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> +18.1%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imagens Geradas</CardTitle>
            <Image className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalImages.toLocaleString()}</div>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> +32%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-yellow-500/50 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAmount.toLocaleString('pt-AO')} Kzs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 lg:col-span-3">
          <CardHeader>
            <CardTitle>Visão Geral da Faturação</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}K`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" /> Modelos Mais Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostUsedModels} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                  {mostUsedModels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;