import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Image, Video, Wand2, Combine, Music, AudioLines } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import RecentCreations from "@/components/RecentCreations";

const Dashboard = () => {
  const { profile } = useSession();
  const navigate = useNavigate();

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

          <div id="tools-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="group cursor-pointer bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/10"
                  onClick={() => navigate(tool.link)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-32 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
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
    </div>
  );
};

export default Dashboard;