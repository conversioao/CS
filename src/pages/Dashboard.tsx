import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sparkles, Image, Video, Wand2, Combine, Music, AudioLines, TrendingUp, Zap, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentCreations from "@/components/RecentCreations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardTutorial from "@/components/DashboardTutorial";

const Dashboard = () => {
  const { profile, user } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    creditsUsed: 0,
    imagesGenerated: 0,
    videosGenerated: 0,
    musicsGenerated: 0,
    totalCreations: 0,
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Fetch credit usage
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id);

      const creditsUsed = transactions
        ?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      // Fetch media counts
      const { data: media } = await supabase
        .from('user_media')
        .select('media_type')
        .eq('user_id', user.id);

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
    };

    fetchStats();
  }, [user]);

  // Check if this is the first login after verification
  useEffect(() => {
    const isFirstLogin = localStorage.getItem('firstLoginAfterVerification') === 'true';
    if (isFirstLogin) {
      setShowTutorial(true);
      setShowWelcomePopup(true);
      localStorage.removeItem('firstLoginAfterVerification');
    }
  }, []);

  const tools = [
    { id: 'generate', title: 'Gerar Imagens', description: 'Crie imagens únicas com IA', icon: Sparkles, color: 'from-purple-500 to-pink-500', link: '/generate' },
    { id: 'edit', title: 'Editar Imagem', description: 'Modifique suas imagens', icon: Wand2, color: 'from-blue-500 to-cyan-500', link: '/edit-image' },
    { id: 'combine', title: 'Combinar Imagens', description: 'Junte duas imagens', icon: Combine, color: 'from-green-500 to-teal-500', link: '/combine-image' },
    { id: 'video', title: 'Gerar Vídeos', description: 'Crie vídeos dinâmicos', icon: Video, color: 'from-red-500 to-orange-500', link: '/generate-video' },
    { id: 'voice', title: 'Gerar Voz', description: 'Crie narrações com IA', icon: AudioLines, color: 'from-indigo-500 to-purple-500', link: '/generate-voice' },
    { id: 'music', title: 'Gerar Música', description: 'Componha trilhas sonoras', icon: Music, color: 'from-yellow-500 to-amber-500', link: '/generate-music' },
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

          <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Olá, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Usuário'}</span>
              </h1>
              <p className="text-muted-foreground text-lg">Vamos criar algo incrível hoje!</p>
            </div>
            <Button size="lg" className="gradient-primary glow-effect" onClick={() => navigate('/generate')}>
              <Sparkles className="w-5 h-5 mr-2" />
              Nova Criação
            </Button>
          </div>

          {/* Link to Statistics page */}
          <div className="mb-8">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Estatísticas</h3>
                      <p className="text-sm text-muted-foreground">Veja seu desempenho e uso</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/statistics')}>
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ferramentas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Ferramentas de IA
            </h2>
          </div>

          <div id="tools-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="group cursor-pointer bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                  onClick={() => navigate(tool.link)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="relative h-40 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <RecentCreations />
        </main>
      </div>

      {showTutorial && <DashboardTutorial onFinish={() => setShowTutorial(false)} />}
      
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 p-8 max-w-md w-full text-center animate-scale-in">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
              Bem-vindo ao Conversio Studio!
            </h1>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">100 Créditos Grátis</span>
                </div>
              </div>
              
              <p className="text-lg font-medium text-muted-foreground">
                Você recebeu 100 créditos para experimentar todas as nossas ferramentas de IA.
              </p>
            </div>

            <div className="mt-8">
              <Button 
                className="gradient-primary"
                onClick={() => setShowWelcomePopup(false)}
              >
                Começar a Criar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;