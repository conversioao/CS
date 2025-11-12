import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import DashboardSidebar from "@/components/DashboardSidebar";
import VerificationPromptModal from "@/components/VerificationPromptModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Zap } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { profile } = useSession();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const navigate = useNavigate();

  const isVerified = profile?.status === 'verified';

  const handleNewCreationClick = () => {
    if (!isVerified) {
      setShowVerificationPrompt(true);
    } else {
      navigate('/generate');
    }
  };

  return (
    <>
      <VerificationPromptModal isOpen={showVerificationPrompt} onClose={() => setShowVerificationPrompt(false)} />

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

            <div className="space-y-12">
              <ToolsSection />
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
                    <Button variant="outline" className="bg-card/50">Ativar Agora</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;