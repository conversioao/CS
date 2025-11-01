import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import modelUGC from "@/assets/model-ugc.jpg";
import modelSocialBoost from "@/assets/model-socialboost.jpg";
import modelFashion from "@/assets/model-fashion.jpg";
import modelVFX from "@/assets/model-vfx.jpg";

const models = [
  {
    name: "Advision UGC",
    description: "Modelo principal para conteúdo autêntico",
    popular: true,
    image: modelUGC,
  },
  {
    name: "SocialBost",
    description: "Otimizado para redes sociais",
    popular: false,
    image: modelSocialBoost,
  },
  {
    name: "FashionFit",
    description: "Especializado em moda e vestuário",
    popular: false,
    image: modelFashion,
  },
  {
    name: "Advision VFX",
    description: "Efeitos visuais avançados",
    popular: false,
    image: modelVFX,
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
              className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover-lift hover-glow relative stagger-item overflow-hidden"
            >
              <img src={model.image} alt={model.name} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
              
              <div className="relative">
                {model.popular && (
                  <Badge className="absolute top-0 right-0 gradient-primary animate-custom-pulse">Popular</Badge>
                )}
                <h3 className="text-xl font-bold mb-2 mt-2">{model.name}</h3>
                <p className="text-muted-foreground text-sm">{model.description}</p>
              </div>
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