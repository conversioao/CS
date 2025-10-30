import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const models = [
  {
    name: "Advision UGC",
    description: "Modelo principal para conteúdo autêntico",
    popular: true,
  },
  {
    name: "SocialBost",
    description: "Otimizado para redes sociais",
    popular: false,
  },
  {
    name: "FashionFit",
    description: "Especializado em moda e vestuário",
    popular: false,
  },
  {
    name: "Advision VFX",
    description: "Efeitos visuais avançados",
    popular: false,
  },
];

const ModelsSection = () => {
  return (
    <section id="modelos" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Modelos Especializados
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o modelo ideal para cada tipo de campanha
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {models.map((model, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover-lift hover-glow relative stagger-item"
            >
              {model.popular && (
                <Badge className="absolute top-4 right-4 gradient-primary animate-custom-pulse">Popular</Badge>
              )}
              <h3 className="text-xl font-bold mb-2 mt-2">{model.name}</h3>
              <p className="text-muted-foreground text-sm">{model.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" variant="outline">
            Ver Todos os Modelos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;
