import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity, ArrowUp, Image, Clock, BarChart as BarChartIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

const monthlyRevenue = [
  { name: 'Jan', revenue: 4000 }, { name: 'Fev', revenue: 3000 },
  { name: 'Mar', revenue: 5000 }, { name: 'Abr', revenue: 4500 },
  { name: 'Mai', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
];

const userGrowth = [
  { name: 'Jan', users: 120 }, { name: 'Fev', users: 180 },
  { name: 'Mar', users: 250 }, { name: 'Abr', users: 310 },
  { name: 'Mai', users: 400 }, { name: 'Jun', users: 480 },
];

const mostUsedModels = [
  { name: 'Persona', usage: 4500, color: '#8884d8' },
  { name: 'Pulse', usage: 3200, color: '#82ca9d' },
  { name: 'StyleAI', usage: 2800, color: '#ffc658' },
  { name: 'Vision', usage: 1800, color: '#ff8042' },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Uma visão geral do seu sistema.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Faturação Total</CardTitle><DollarSign className="h-5 w-5 text-primary" /></CardHeader>
          <CardContent><div className="text-3xl font-bold">1.250.000 Kzs</div><p className="text-xs text-green-400 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> +20.1%</p></CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Usuários</CardTitle><Users className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">+480</div><p className="text-xs text-green-400 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> +18.1%</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Imagens Geradas</CardTitle><Image className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">8,450</div><p className="text-xs text-green-400 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> +32%</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-yellow-500/50 transition-colors duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle><Clock className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-3xl font-bold">12</div><p className="text-xs text-muted-foreground">Aguardando aprovação</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-yellow-500/50 transition-colors duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Valor Pendente</CardTitle><Activity className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-3xl font-bold">150.000 Kzs</div><p className="text-xs text-muted-foreground">Total em pagamentos</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 lg:col-span-3">
          <CardHeader><CardTitle>Visão Geral da Faturação</CardTitle></CardHeader>
          <CardContent className="pl-2"><ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyRevenue}><defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}K`} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" /></AreaChart></ResponsiveContainer></CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChartIcon className="w-5 h-5" /> Modelos Mais Usados</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={mostUsedModels} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" /><XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} /><Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>{mostUsedModels.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;