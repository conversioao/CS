import DashboardNav from "@/components/DashboardNav";
import ToolsSection from "@/components/ToolsSection";
import RecentCreations from "@/components/RecentCreations";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <DashboardNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">
        <div className="mb-8 mt-4">
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
  );
};

export default Dashboard;
