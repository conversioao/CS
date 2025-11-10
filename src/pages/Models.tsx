import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Palette, Zap, Rocket, Wand2, Video, AudioLines, Combine, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  credit_cost: number;
  image_url: string;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  model: Sparkles,
  tool: Wand2,
};

const categoryLabels: { [key: string]: string } = {
  model: "Modelo",
  tool: "Ferramenta",
};

const Models = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      const { data, error } = await supabase
        .from('models_and_tools')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'model') // Only show models, not tools
        .order('name');

      if (error) {
        console.error('Error fetching models:', error);
      } else {
        setModels(data || []);
      }
      setLoading(false);
    };

    fetchModels();
  }, []);

  const getModelRoute = (model: Model) => {
    switch (model.name) {
      case 'Conversio Studio — Persona':
        return '/generate?model=Conversio%20Studio%20%E2%80%94%20Persona';
      case 'Conversio Studio — Pulse':
        return '/generate?model=Conversio%20Studio%20%E2%80%94%20Pulse';
      case 'Conversio Studio — StyleAI':
        return '/generate?model=Conversio%20Studio%20%E2%80%94%20StyleAI';
      case 'Conversio Studio — Vision':
        return '/generate?model=Conversio%20Studio%20%E2%80%94%20Vision';
      case 'Edição de Imagem':
        return '/edit-image';
      case 'Combinação de Imagens':
        return '/combine-image';
      case 'Geração de Vídeos':
        return '/generate-video';
      case 'Geração de Voz':
        return '/generate-voice';
      default:
        return '/generate';
    }
  };

  const handleViewDetails = (model: Model) => {
    setSelectedModel(model);
  };

  const handleUseModel = (model: Model) => {
    const route = getModelRoute(model);
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block"><DashboardSidebar /></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </main>
        </div>
      </div>
    );
  }

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
            {models.map((model) => {
              const Icon = categoryIcons[model.category] || Sparkles;
              return (
                <div
                  key={model.id}
                  className="group bg-secondary/20 border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 relative"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={model.image_url} 
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{categoryLabels[model.category]}</Badge>
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {model.credit_cost}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{model.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {model.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewDetails(model)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <div className="space-y-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                              <img 
                                src={selectedModel?.image_url} 
                                alt={selectedModel?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold mb-2">{selectedModel?.name}</h3>
                              <p className="text-muted-foreground mb-4">{selectedModel?.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{categoryLabels[selectedModel?.category || 'model']}</Badge>
                                  <div className="flex items-center gap-1 text-sm font-semibold">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    {selectedModel?.credit_cost} créditos
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedModel(null)}
                              >
                                Voltar
                              </Button>
                              <Button 
                                className="flex-1 gradient-primary"
                                onClick={() => {
                                  if (selectedModel) handleUseModel(selectedModel);
                                  setSelectedModel(null);
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Usar Modelo
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        className="flex-1 gradient-primary"
                        onClick={() => handleUseModel(model)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Usar
                      </Button>
                    </div>
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