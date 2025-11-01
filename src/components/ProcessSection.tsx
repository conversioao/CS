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
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary">
                      <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Icon className="w-10 h-10 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-lg">
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