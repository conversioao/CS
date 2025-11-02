import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import RecentCreations from "@/components/RecentCreations";
import DashboardTutorial from "@/components/DashboardTutorial";
import DashboardSidebar from "@/components/DashboardSidebar";
import VerificationPromptModal from "@/components/VerificationPromptModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

const Dashboard = () => {
  const { profile, loading } = useSession();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const navigate = useNavigate();

  const isVerified = profile?.status === 'verified';

  useEffect(() => {
    if (loading) return;
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser) {
      setShowTutorial(true);
    }
  }, [loading]);

  const handleFinishTutorial = () => {
    setShowTutorial(false);
    localStorage.removeItem('isNewUser');
  };

  const handleNewCreationClick = () => {
    if (!isVerified) {
      setShowVerificationPrompt(true);
    } else {
      navigate('/generate');
    }
  };

  return (
    <>
      {showTutorial && <DashboardTutorial onFinish={handleFinishTutorial} />}
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
              <RecentCreations />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;