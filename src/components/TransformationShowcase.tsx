import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import modelPersona from "@/assets/model-persona.jpg";
import modelPulse from "@/assets/model-pulse.jpg";
import modelStyleAI from "@/assets/model-styleai.jpg";
import modelVision from "@/assets/model-vision.jpg";

const TransformationShowcase = () => {
  const models = [
    {
      image: modelPersona,
      name: "Conversio Studio — Persona",
      description: "Cria anúncios autênticos com pessoas verdadeiras e produtos reais.",
      gradient: "from-purple-500/20 to-pink-500/20",
      slug: "persona"
    },
    {
      image: modelPulse,
      name: "Conversio Studio — Pulse",
      description: "Transforma o teu conteúdo em anúncios vibrantes e cheios de vida.",
      gradient: "from-pink-500/20 to-red-500/20",
      slug: "pulse"
    },
    {
      image: modelStyleAI,
      name: "Conversio Studio — StyleAI",
      description: "Experimenta digitalmente as tuas roupas com realismo profissional.",
      gradient: "from-blue-500/20 to-purple-500/20",
      slug: "styleai"
    },
    {
      image: modelVision,
      name: "Conversio Studio — Vision",
      description: "Cria anúncios com efeitos visuais dignos de cinema.",
      gradient: "from-green-500/20 to-blue-500/20",
      slug: "vision"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nossos <span className="gradient-text">Modelos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolhe o modelo de IA perfeito para o teu tipo de conteúdo. 
            Cada modelo foi otimizado para diferentes necessidades criativas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {models.map((model, index) => (
            <Link
              to={`/model/${model.slug}`}
              key={index}
              className="group relative opacity-0 hover-lift block"
              style={{ 
                animation: `fadeInUp 0.8s ease-out forwards`,
                animationDelay: `${index * 0.15}s` 
              }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-glow transition-all duration-500 border border-white/5">
                {/* Imagem de fundo */}
                <div className="relative h-[400px] overflow-hidden">
                  <img 
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Overlay com gradiente personalizado */}
                  {/* <div className={`absolute inset-0 bg-gradient-to-t ${model.gradient} to-background/95`} /> */}
                  
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Conteúdo */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {model.name}
                    </h3>
                    <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                    {model.description}
                  </p>
                  
                  {/* Barra decorativa */}
                  <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" />
                </div>

                {/* Elementos decorativos */}
                <div className="absolute top-4 right-4 w-12 h-12 border-2 border-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-6 right-6 w-8 h-8 border-2 border-accent/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationShowcase;