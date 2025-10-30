import { ArrowRight } from "lucide-react";
import transformExample1 from "@/assets/transformation-example-1.jpg";
import transformExample2 from "@/assets/transformation-example-2.jpg";
import transformExample3 from "@/assets/transformation-example-3.jpg";

const TransformationShowcase = () => {
  const examples = [
    {
      image: transformExample1,
      title: "Produtos para Anúncios",
      description: "Transforme fotos simples de produtos em anúncios profissionais com IA"
    },
    {
      image: transformExample2,
      title: "Efeitos Cinematográficos",
      description: "Adicione motion blur, partículas e efeitos visuais impressionantes"
    },
    {
      image: transformExample3,
      title: "Anúncios de Luxo",
      description: "Crie anúncios premium com VFX e design sofisticado"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Veja a <span className="gradient-text">Transformação</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            De uma simples foto de produto a um anúncio profissional em segundos. 
            Nossa IA entende o contexto e cria designs que convertem.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          {examples.map((example, index) => (
            <div 
              key={index}
              className="group transform-showcase-item opacity-0"
              style={{ 
                animation: `fadeInUp 0.8s ease-out forwards`,
                animationDelay: `${index * 0.2}s` 
              }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-glow transition-all duration-500">
                <img 
                  src={example.image}
                  alt={example.title}
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-8">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {example.title}
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
                  </h3>
                  <p className="text-muted-foreground">{example.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationShowcase;