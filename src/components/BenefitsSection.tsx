import { Zap, Target, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Velocidade Incomparável",
    description: "Crie anúncios profissionais em segundos, não horas. Nossa IA trabalha 100x mais rápido que designers humanos.",
  },
  {
    icon: Target,
    title: "Precisão Cirúrgica",
    description: "Modelos treinados com milhões de anúncios de sucesso para garantir resultados que convertem.",
  },
  {
    icon: TrendingUp,
    title: "ROI Maximizado",
    description: "Reduza custos de produção em 90% enquanto aumenta taxas de conversão com designs otimizados.",
  },
  {
    icon: Award,
    title: "Qualidade Garantida",
    description: "Resultados profissionais em alta resolução, prontos para qualquer plataforma.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Por que escolher o Conversio Studio?
          </h2>
          <p className="text-xl text-muted-foreground">
            A plataforma mais avançada de geração de anúncios com IA do mercado
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 text-center"
            >
              <div className="flex justify-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary">
                    <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <benefit.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;