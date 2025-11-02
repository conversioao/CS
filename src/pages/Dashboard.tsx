import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import RecentCreations from "@/components/RecentCreations";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardTutorial from "@/components/DashboardTutorial";
import DashboardSidebar from "@/components/DashboardSidebar";
import VerificationModal from "@/components/VerificationModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, profile, loading, refetchProfile } = useSession();
  const [showPostVerificationWelcome, setShowPostVerificationWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const isVerified = profile?.status === 'verified';

  const handleVerificationSuccess = async () => {
    // A sessão já foi atualizada na modal, agora apenas buscamos o perfil atualizado.
    await refetchProfile();
  };

  const handleStartTutorial = () => {
    setShowPostVerificationWelcome(false);
    setShowTutorial(true);
  };

  const handleFinishTutorial = () => {
    setShowTutorial(false);
    localStorage.removeItem('isNewUser');
  };
  
  useEffect(() => {
    if (loading) return;
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser && isVerified) {
      setShowPostVerificationWelcome(true);
    }
  }, [isVerified, loading]);

  return (
    <>
      {showPostVerificationWelcome && (
        <WelcomeModal 
          isOpen={showPostVerificationWelcome} 
          onClose={handleStartTutorial} 
          userName={profile?.full_name?.split(' ')[0] || 'Criador'} 
        />
      )}
      {showTutorial && <DashboardTutorial onFinish={handleFinishTutorial} />}
      {user && !isVerified && (
        <VerificationModal 
          isOpen={!isVerified} 
          userId={user.id} 
          onSuccess={handleVerificationSuccess} 
        />
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
              <Link to="/generate">
                <Button size="lg" className="gradient-primary glow-effect" disabled={!isVerified}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Nova Criação
                </Button>
              </Link>
            </div>

            <div className={cn("space-y-12", !isVerified && "opacity-20 pointer-events-none")}>
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