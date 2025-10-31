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
    <section id="precos" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Planos e Preços
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o pacote ideal para suas necessidades criativas
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative ${
                plan.popular 
                  ? "border-2 border-primary shadow-2xl scale-105" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary">
                  Mais Popular
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
                <p className="text-muted-foreground">{plan.credits}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.popular ? "gradient-primary" : ""}`}
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
