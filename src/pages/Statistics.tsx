import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Image, Video, Music, AudioLines, Award } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Statistics = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    creditsUsed: 0,
    imagesGenerated: 0,
    videosGenerated: 0,
    musicsGenerated: 0,
    totalCreations: 0,
  });
  const [usageData, setUsageData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Fetch credit usage
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('amount, transaction_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const creditsUsed = transactions
        ?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      // Fetch media counts
      const { data: media } = await supabase
        .from('user_media')
        .select('media_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const imagesGenerated = media?.filter(m => m.media_type === 'image').length || 0;
      const videosGenerated = media?.filter(m => m.media_type === 'video').length || 0;
      const musicsGenerated = media?.filter(m => m.media_type === 'audio').length || 0;

      setStats({
        creditsUsed,
        imagesGenerated,
        videosGenerated,
        musicsGenerated,
        totalCreations: (media?.length || 0),
      });

      // Prepare data for chart
      const dailyData: { [key: string]: any } = {};
      
      // Process transactions
      transactions?.forEach(t => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { date, credits: 0, creations: 0 };
        }
        if (t.amount < 0) {
          dailyData[date].credits += Math.abs(t.amount);
        }
      });

      // Process media
      media?.forEach(m => {
        const date = new Date(m.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { date, credits: 0, creations: 0 };
        }
        dailyData[date].creations += 1;
      });

      // Convert to array and sort
      const sortedData = Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate cumulative values
      let cumulativeCredits = 0;
      let cumulativeCreations = 0;
      const chartData = sortedData.map((item: any) => {
        cumulativeCredits += item.credits;
        cumulativeCreations += item.creations;
        return {
          ...item,
          cumulativeCredits,
          cumulativeCreations
        };
      });

      setUsageData(chartData);
    };

    fetchStats();
  }, [user?.id]);

  const statsCards = [
    { label: 'Créditos Usados', value: stats.creditsUsed, icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { label: 'Imagens Geradas', value: stats.imagesGenerated, icon: Image, color: 'from-purple-500 to-pink-500' },
    { label: 'Vídeos Criados', value: stats.videosGenerated, icon: Video, color: 'from-blue-500 to-cyan-500' },
    { label: 'Músicas Criadas', value: stats.musicsGenerated, icon: Music, color: 'from-green-500 to-teal-500' },
    { label: 'Total de Criações', value: stats.totalCreations, icon: Award, color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 gradient-text">Estatísticas</h1>
                <p className="text-muted-foreground text-lg">Analise seu desempenho e uso da plataforma</p>
              </div>
              <Button size="lg" className="gradient-primary" onClick={() => navigate('/dashboard')}>
                Voltar ao Dashboard
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={stat.label}
                    className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Usage Chart */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 mb-8">
              <CardHeader>
                <CardTitle>Uso ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'cumulativeCredits') return [value, 'Créditos Usados'];
                          if (name === 'cumulativeCreations') return [value, 'Criações Totais'];
                          return [value, name];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCredits" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }} 
                        activeDot={{ r: 8 }} 
                        name="Créditos Usados"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCreations" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: 'hsl(var(--accent))' }} 
                        activeDot={{ r: 8 }} 
                        name="Criações Totais"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;