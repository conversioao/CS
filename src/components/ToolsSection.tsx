import { ImagePlus, Video, Wand2, Layers, Music } from "lucide-react";
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
      <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">
        Ferramentas Principais
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-x-12 sm:gap-x-16 gap-y-8">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          
          const toolContent = (
            <div className={`group relative flex flex-col items-center text-center p-4 transition-all duration-300 w-40 ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <div 
                className="relative mb-4"
              >
                <div className="absolute -inset-4 bg-primary/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }} />
                <Icon className="relative w-12 h-12 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_hsl(var(--primary))]"/>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
          );

          return tool.disabled ? (
            <div key={tool.title}>{toolContent}</div>
          ) : (
            <Link key={tool.title} to={tool.link}>
              {toolContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ToolsSection;