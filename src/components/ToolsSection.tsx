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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          
          const toolContent = (
            <div className={`group relative flex flex-col items-center text-center p-4 transition-all duration-300 rounded-2xl ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <div 
                className="relative mb-6 animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-[-8px] bg-primary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-card to-secondary transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-9 h-9 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
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