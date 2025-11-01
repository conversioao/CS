import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Palette, Zap, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import modelPersona from "@/assets/model-persona-cover.jpg";
import modelPulse from "@/assets/model-pulse-cover.jpg";
import modelStyleAI from "@/assets/model-styleai-cover.jpg";
import modelVision from "@/assets/model-vision-cover.jpg";

const models = [
  {
    icon: Sparkles,
    title: "Conversio Studio — Persona",
    description: "Cria anúncios autênticos com pessoas verdadeiras e produtos reais.",
    tags: ["UGC", "Autêntico", "Realista"],
    badge: "Mais Popular",
    color: "from-purple-500 to-pink-500",
    image: modelPersona
  },
  {
    icon: Zap,
    title: "Conversio Studio — Pulse",
    description: "Transforma o teu conteúdo em anúncios vibrantes e cheios de vida.",
    tags: ["Viral", "Engajamento", "Social Media"],
    color: "from-pink-500 to-red-500",
    image: modelPulse
  },
  {
    icon: Palette,
    title: "Conversio Studio — StyleAI",
    description: "Experimenta digitalmente as tuas roupas com realismo profissional.",
    tags: ["Moda", "Tendências", "Editorial"],
    color: "from-blue-500 to-purple-500",
    image: modelStyleAI
  },
  {
    icon: Rocket,
    title: "Conversio Studio — Vision",
    description: "Cria anúncios com efeitos visuais dignos de cinema.",
    tags: ["VFX", "Cinematográfico", "Premium"],
    color: "from-green-500 to-blue-500",
    image: modelVision
  }
];

const Models = () => {
  return (
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
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Modelos de IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Escolha o modelo ideal para cada tipo de criação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map((model, index) => {
              const Icon = model.icon;
              return (
                <div
                  key={index}
                  className="group bg-secondary/20 border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 relative"
                >
                  {model.badge && (
                    <Badge className="absolute top-4 right-4 bg-primary z-10">
                      {model.badge}
                    </Badge>
                  )}
                  
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={model.image} 
                      alt={model.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{model.title}</h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {model.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {model.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Link to={`/generate?model=${encodeURIComponent(model.title)}`}>
                      <Button 
                        variant={model.badge ? "default" : "outline"} 
                        className={model.badge ? "w-full gradient-primary" : "w-full"}
                      >
                        <Sparkles className="w-4 h-4" />
                        Usar Modelo
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Models;