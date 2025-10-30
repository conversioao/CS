import { Briefcase, Palette, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Briefcase,
    title: "Para Negócios",
    description: "Crie campanhas de produto automaticamente.",
  },
  {
    icon: Palette,
    title: "Para Criadores",
    description: "Melhore a presença nas redes sociais com designs profissionais.",
  },
  {
    icon: Building2,
    title: "Para Agências",
    description: "Escale a criação de anúncios com fluxos automatizados.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in">
          Transforme ideias simples em anúncios que vendem
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover-lift hover-glow stagger-item"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4 transition-transform hover:scale-110" />
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
