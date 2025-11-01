import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import RecentCreations from "@/components/RecentCreations";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardTutorial from "@/components/DashboardTutorial";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true') {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    setShowTutorial(true);
  };

  const handleFinishTutorial = () => {
    setShowTutorial(false);
    localStorage.removeItem('isNewUser');
  };

  return (
    <>
      {showWelcomeModal && <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseModal} />}
      {showTutorial && <DashboardTutorial onFinish={handleFinishTutorial} />}

      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            {/* Creative Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-20" />
              <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-[10%] right-[5%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
              <div className="absolute bottom-[5%] left-[20%] w-[25rem] h-[25rem] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
            </div>

            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                Bem-vindo ao Conversio Studio
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Crie conteúdo incrível com IA - Imagens, Vídeos e Música
              </p>
            </div>
            <ToolsSection />
            <RecentCreations />
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;