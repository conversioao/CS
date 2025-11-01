import { ImagePlus, Video, Wand2, Layers, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const tools = [
  {
    title: "Gerar Imagens",
    description: "Crie imagens incríveis com IA",
    icon: ImagePlus,
    link: "/generate",
  },
  {
    title: "Gerar Vídeos",
    description: "Produza vídeos únicos",
    icon: Video,
    link: "/generate-video",
  },
  {
    title: "Editar Imagem",
    description: "Transforme suas imagens",
    icon: Wand2,
    link: "/edit-image",
  },
  {
    title: "Combinar Imagens",
    description: "Funda múltiplas imagens",
    icon: Layers,
    link: "/combine-image",
  },
  {
    title: "Gerar Músicas",
    description: "Em breve - Crie músicas com Suno AI",
    icon: Music,
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
              className={`group relative overflow-hidden transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 ${
                tool.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10'
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4 relative z-10">
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-card transition-all duration-300 group-hover:scale-110 ring-1 ring-inset ring-white/10">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500 group-hover:animate-pulse" />
                  <Icon className="w-8 h-8 text-foreground/80 group-hover:text-primary transition-colors duration-300 relative z-10" />
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