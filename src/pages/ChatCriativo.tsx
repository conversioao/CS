import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Sparkles, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const ChatCriativo = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-xl border-primary/20 text-center p-8 sm:p-12 shadow-2xl shadow-primary/10">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
              Desbloqueie o ChatCriativo
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
              Esta é uma ferramenta premium. Adquira uma licença para ter acesso a um assistente de IA para criação de conteúdo, roteiros e muito mais.
            </p>
            
            <Link to="/credits">
              <Button size="lg" className="gradient-primary glow-effect text-lg px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Adquirir Licença
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ChatCriativo;