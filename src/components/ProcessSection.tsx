import { Upload, Sparkles, Download, Zap } from "lucide-react";

const ProcessSection = () => {
  const steps = [
    {
      icon: Upload,
      title: "1. Faça Upload",
      description: "Envie uma foto do seu produto ou qualquer imagem que deseja transformar"
    },
    {
      icon: Sparkles,
      title: "2. IA Trabalha",
      description: "Nossa IA analisa e cria múltiplas versões profissionais automaticamente"
    },
    {
      icon: Zap,
      title: "3. Personalize",
      description: "Ajuste textos, cores e efeitos com nossos modelos especializados"
    },
    {
      icon: Download,
      title: "4. Publique",
      description: "Baixe em alta qualidade e publique em todas suas redes sociais"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Como <span className="gradient-text">Funciona</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Processo simples e rápido em 4 passos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="process-step opacity-0"
                style={{ 
                  animation: `fadeInScale 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.15}s` 
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                  <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-primary flex items-center justify-center glow-effect">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;