import { Upload, Sparkles, Download, Zap } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Faça Upload",
    description: "Envie uma foto do seu produto ou qualquer imagem que deseja transformar.",
  },
  {
    icon: Sparkles,
    title: "IA Trabalha",
    description: "Nossa IA analisa e cria múltiplas versões profissionais automaticamente.",
  },
  {
    icon: Zap,
    title: "Personalize",
    description: "Ajuste textos, cores e efeitos com nossos modelos especializados.",
  },
  {
    icon: Download,
    title: "Publique",
    description: "Baixe em alta qualidade e publique em todas suas redes sociais.",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Como <span className="gradient-text">Funciona</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Um processo simples e intuitivo para transformar suas ideias em realidade.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-border/50 hidden md:block" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index}
                  className="text-center flex flex-col items-center"
                >
                  <div className="relative mb-6 group">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-card relative transition-all duration-300 group-hover:scale-110 ring-1 ring-inset ring-white/10">
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500 group-hover:animate-pulse" />
                      
                      <Icon className="w-10 h-10 text-foreground/80 group-hover:text-primary transition-colors duration-300 relative z-10" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground border-4 border-background">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed px-4">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;