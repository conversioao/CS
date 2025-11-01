import { ImagePlus, Video, Wand2, Layers, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const tools = [
  {
    title: "Gerar Imagens",
    description: "Crie imagens incríveis com IA",
    icon: ImagePlus,
    gradient: "from-indigo-500 to-purple-500",
    link: "/generate",
  },
  {
    title: "Gerar Vídeos",
    description: "Produza vídeos únicos",
    icon: Video,
    gradient: "from-pink-500 to-purple-500",
    link: "/generate-video",
  },
  {
    title: "Editar Imagem",
    description: "Transforme suas imagens",
    icon: Wand2,
    gradient: "from-cyan-500 to-blue-500",
    link: "/edit-image",
  },
  {
    title: "Combinar Imagens",
    description: "Funda múltiplas imagens",
    icon: Layers,
    gradient: "from-green-500 to-emerald-500",
    link: "/combine-image",
  },
  {
    title: "Gerar Músicas",
    description: "Em breve - Crie músicas com Suno AI",
    icon: Music,
    gradient: "from-orange-500 to-red-500",
    link: "#",
    disabled: true,
  },
];

const ToolsSection = () => {
  return (
    <section id="tools-section" className="mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text">
        Ferramentas Principais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          
          const cardContent = (
            <Card 
              className={`group transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 ${
                tool.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-105 hover:border-primary/50'
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center ${!tool.disabled && 'group-hover:scale-110'} transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </CardContent>
            </Card>
          );

          return tool.disabled ? (
            <div key={tool.title}>{cardContent}</div>
          ) : (
            <Link key={tool.title} to={tool.link}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ToolsSection;