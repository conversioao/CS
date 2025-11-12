import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import DashboardSidebar from "@/components/DashboardSidebar";
import VerificationPromptModal from "@/components/VerificationPromptModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Zap, Palette, Wand2, Video, Music, MessageSquare, Image } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { profile, refetchProfile } = useSession();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  const isVerified = profile?.status === 'verified';

  // Check if user has seen the tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleNewCreationClick = () => {
    if (!isVerified) {
      setShowVerificationPrompt(true);
    } else {
      navigate('/generate');
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleVerifyAccount = async () => {
    if (!profile) return;
    
    // In a real app, this would open a modal to input the verification code
    // For now, we'll simulate the verification process
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'verified' })
      .eq('id', profile.id);

    if (error) {
      toast.error("Erro ao verificar conta", { description: error.message });
    } else {
      await refetchProfile();
      setShowVerificationPrompt(false);
      toast.success("Conta verificada com sucesso!");
    }
  };

  // Tool data with modern icons and descriptions
  const tools = [
    {
      id: 'generate',
      title: 'Gerar Imagens',
      description: 'Crie imagens únicas com IA a partir de texto',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      link: '/generate',
    },
    {
      id: 'edit',
      title: 'Editar Imagem',
      description: 'Modifique e melhore suas imagens existentes',
      icon: Wand2,
      color: 'from-blue-500 to-cyan-500',
      link: '/edit-image',
    },
    {
      id: 'combine',
      title: 'Combinar Imagens',
      description: 'Junte duas imagens em uma só criação',
      icon: Palette,
      color: 'from-green-500 to-teal-500',
      link: '/combine-image',
    },
    {
      id: 'video',
      title: 'Gerar Vídeos',
      description: 'Transforme suas ideias em vídeos dinâmicos',
      icon: Video,
      color: 'from-red-500 to-orange-500',
      link: '/generate-video',
    },
    {
      id: 'voice',
      title: 'Gerar Voz',
      description: 'Crie narrações e áudios com IA',
      icon: MessageSquare,
      color: 'from-indigo-500 to-purple-500',
      link: '/generate-voice',
    },
    {
      id: 'music',
      title: 'Gerar Música',
      description: 'Componha trilhas sonoras personalizadas',
      icon: Music,
      color: 'from-yellow-500 to-amber-500',
      link: '/generate-music',
    },
  ];

  return (
    <>
      {showTutorial && (
        <div className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Conversio Studio!</h2>
              <p className="text-muted-foreground">
                Gostaria de fazer um tour rápido para conhecer as principais funcionalidades?
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleTutorialClose} className="flex-1 gradient-primary">
                Sim, quero o tour
              </Button>
              <Button variant="outline" onClick={handleTutorialClose} className="flex-1">
                Pular
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        
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
                <p className="text-muted-foreground text-lg">
                  Vamos criar algo incrível hoje!
                </p>
              </div>
              <Button size="lg" className="gradient-primary glow-effect" onClick={handleNewCreationClick}>
                <Sparkles className="w-5 h-5 mr-2" />
                Nova Criação
              </Button>
            </div>

            {/* Modern Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} to={tool.link}>
                    <Card className="group bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/10">
                      <CardContent className="p-0">
                        <div className="relative h-32 overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
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
                          <p className="text-sm text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-green-400" />
                  <span>Exclusivo: Geração de Imagens por WhatsApp</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  Ative a subscrição e crie imagens diretamente do seu WhatsApp. <br />
                  Custo: <strong>15.000 créditos/mês</strong>.
                </p>
                <Link to="/account?tab=integrations">
                  <Button variant="outline" className="bg-card/50 hover:bg-card">Ativar Agora</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <VerificationPromptModal 
        isOpen={showVerificationPrompt} 
        onClose={() => setShowVerificationPrompt(false)} 
        onVerify={handleVerifyAccount}
      />
    </>
  );
};

export default Dashboard;