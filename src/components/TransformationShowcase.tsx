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
      slug: "persona",
    },
    {
      image: modelPulse,
      name: "Conversio Studio — Pulse",
      description: "Transforma o teu conteúdo em anúncios vibrantes e cheios de vida.",
      gradient: "from-pink-500/20 to-red-500/20",
      slug: "pulse",
    },
    {
      image: modelStyleAI,
      name: "Conversio Studio — StyleAI",
      description: "Experimenta digitalmente as tuas roupas com realismo profissional.",
      gradient: "from-blue-500/20 to-purple-500/20",
      slug: "styleai",
    },
    {
      image: modelVision,
      name: "Conversio Studio — Vision",
      description: "Cria anúncios com efeitos visuais dignos de cinema.",
      gradient: "from-green-500/20 to-blue-500/20",
      slug: "vision",
    }
  ];

  return (
    <section className="py-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nossos <span className="gradient-text">Modelos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Escolhe o modelo de IA perfeito para o teu tipo de conteúdo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-white/5">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-48 object-contain"
                />
                {/* Conteúdo */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white leading-tight">
                    {model.name}
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {model.description}
                  </p>
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