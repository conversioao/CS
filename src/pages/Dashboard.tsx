import DashboardHeader from "@/components/DashboardHeader";
import ToolsSection from "@/components/ToolsSection";
import DashboardTutorial from "@/components/DashboardTutorial";
import DashboardSidebar from "@/components/DashboardSidebar";
import VerificationPromptModal from "@/components/VerificationPromptModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Image, Video, AudioLines, Music, Users, CreditCard, TrendingUp } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { profile, loading } = useSession();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [stats, setStats] = useState({
    images: 0,
    videos: 0,
    audio: 0,
    music: 0
  });
  const navigate = useNavigate();

  const isVerified = profile?.status === 'verified';

  useEffect(() => {
    if (loading) return;
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser) {
      setShowTutorial(true);
    }
    calculateUserStats();
  }, [loading]);

  const calculateUserStats = async () => {
    if (!profile) return;
    
    try {
      // Get image count from localStorage
      const imageHistory = JSON.parse(localStorage.getItem('image_history') || '[]');
      
      // Get video count from localStorage
      const videoHistory = JSON.parse(localStorage.getItem('video_history') || '[]');
      
      // Get audio count from localStorage
      const audioHistory = JSON.parse(localStorage.getItem('audio_history') || '[]');
      
      setStats({
        images: imageHistory.length,
        videos: videoHistory.length,
        audio: audioHistory.length,
        music: 0 // Placeholder for music count
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

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

  const statItems = [
    { icon: Image, label: "Imagens", value: stats.images, color: "text-blue-500" },
    { icon: Video, label: "Vídeos", value: stats.videos, color: "text-purple-500" },
    { icon: AudioLines, label: "Áudios", value: stats.audio, color: "text-green-500" },
    { icon: Music, label: "Músicas", value: stats.music, color: "text-pink-500" },
    { icon: CreditCard, label: "Créditos", value: profile?.credits || 0, color: "text-yellow-500" },
    { icon: Users, label: "Indicações", value: 0, color: "text-cyan-500" }
  ];

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

            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Olá, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Usuário'}</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Bem-vindo ao seu painel criativo
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statItems.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card/50 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-8">
              <ToolsSection />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;