import { ImagePlus, Video, Wand2, Layers, Music, AudioLines } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import VerificationPromptModal from "./VerificationPromptModal";

const tools = [
  {
    title: "Gerar Imagens",
    description: "Crie a partir de texto ou imagens.",
    icon: ImagePlus,
    link: "/generate",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Gerar Vídeos",
    description: "Dê vida às suas ideias em movimento.",
    icon: Video,
    link: "/generate-video",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Gerador de Voz",
    description: "Crie narrações com vozes realistas.",
    icon: AudioLines,
    link: "/generate-voice",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Editar Imagem",
    description: "Remova fundos, mude estilos e mais.",
    icon: Wand2,
    link: "/edit-image",
    color: "from-orange-500 to-yellow-500",
  },
  {
    title: "Combinar Imagens",
    description: "Funda duas imagens em uma nova criação.",
    icon: Layers,
    link: "/combine-image",
    color: "from-red-500 to-rose-500",
  },
  {
    title: "Gerar Músicas",
    description: "Crie trilhas sonoras com Suno AI.",
    icon: Music,
    link: "/generate-music",
    color: "from-gray-500 to-gray-600",
  },
];

const ToolsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile } = useSession();
  const navigate = useNavigate();
  const isVerified = profile?.status === 'verified';

  const handleToolClick = (link: string) => {
    if (!isVerified) {
      setIsModalOpen(true);
    } else {
      navigate(link);
    }
  };

  return (
    <section id="tools-section">
      <VerificationPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <h2 className="text-3xl font-bold mb-6">Ferramentas de IA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.title} onClick={() => handleToolClick(tool.link)} className="cursor-pointer h-full">
              <Card
                className="group relative overflow-hidden bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 border-0 h-full"
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <div className="flex items-center text-sm font-semibold text-primary">
                    <span>Começar a criar</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ToolsSection;