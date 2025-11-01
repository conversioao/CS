import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "14.950 Kzs",
    credits: "100 créditos",
    features: [
      "100 créditos de geração",
      "Imagens em alta resolução",
      "Suporte básico",
      "Válido por 30 dias",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "49.950 Kzs",
    credits: "500 créditos",
    features: [
      "500 créditos de geração",
      "Imagens em alta resolução",
      "Geração de vídeos",
      "Suporte prioritário",
      "Válido por 60 dias",
    ],
    popular: true,
  },
  {
    name: "Studio",
    price: "124.950 Kzs",
    credits: "1500 créditos",
    features: [
      "1500 créditos de geração",
      "Todos os recursos Pro",
      "Acesso a novos recursos",
      "Suporte VIP 24/7",
      "Válido por 90 dias",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-20 px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Planos e <span className="gradient-text">Preços</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o pacote ideal para suas necessidades criativas
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative transition-all duration-300 bg-card/50 backdrop-blur-sm border ${
                plan.popular 
                  ? "border-2 border-primary shadow-2xl shadow-primary/20 scale-105" 
                  : "border-border hover:border-primary/50 hover:scale-105"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary text-sm px-4 py-1">
                  Mais Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.credits}</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg"
                className={`w-full text-lg ${plan.popular ? "gradient-primary glow-effect" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                Começar Agora
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;