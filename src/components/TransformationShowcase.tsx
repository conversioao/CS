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
      slug: "persona",
    },
    {
      image: modelPulse,
      name: "Conversio Studio — Pulse",
      description: "Transforma o teu conteúdo em anúncios vibrantes e cheios de vida.",
      slug: "pulse",
    },
    {
      image: modelStyleAI,
      name: "Conversio Studio — StyleAI",
      description: "Experimenta digitalmente as tuas roupas com realismo profissional.",
      slug: "styleai",
    },
    {
      image: modelVision,
      name: "Conversio Studio — Vision",
      description: "Cria anúncios com efeitos visuais dignos de cinema.",
      slug: "vision",
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="gradient-text">Modelos de IA</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o modelo de IA perfeito para o teu tipo de conteúdo e veja a mágica acontecer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {models.map((model, index) => (
            <Link
              to={`/model/${model.slug}`}
              key={index}
              className="group relative opacity-0 block"
              style={{ 
                animation: `fadeInUp 0.8s ease-out forwards`,
                animationDelay: `${index * 0.1}s` 
              }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 border border-border/50 h-full flex flex-col hover:-translate-y-2">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 bg-card flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-foreground leading-tight flex-grow">
                    {model.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    {model.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-primary font-semibold text-sm">
                    <span>Ver detalhes</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationShowcase;