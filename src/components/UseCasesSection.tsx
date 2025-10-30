import { ShoppingBag, Video, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const UseCasesSection = () => {
  const useCases = [
    {
      icon: ShoppingBag,
      title: "E-commerce",
      description: "Transforme fotos de produtos em anúncios que vendem. Crie banners para suas lojas online em minutos.",
      features: ["Banners de produtos", "Anúncios de promoções", "Stories de lançamento"],
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: Video,
      title: "Redes Sociais",
      description: "Crie conteúdo visual impactante para Instagram, Facebook e TikTok com modelos otimizados.",
      features: ["Posts e stories", "Reels e shorts", "Anúncios pagos"],
      color: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Image,
      title: "Marketing Digital",
      description: "Produza campanhas completas com múltiplas variações de anúncios em alta qualidade.",
      features: ["A/B testing visual", "Campanhas sazonais", "Retargeting criativo"],
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Sparkles,
      title: "Conteúdo UGC",
      description: "Dê vida ao seu conteúdo gerado por usuários com efeitos profissionais e edições rápidas.",
      features: ["Depoimentos visuais", "Reviews em vídeo", "Casos de sucesso"],
      color: "from-orange-500/20 to-yellow-500/20"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Perfeito para <span className="gradient-text">Todo Negócio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seja você um empreendedor solo ou uma agência, temos as ferramentas certas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={index}
                className="use-case-card opacity-0 group"
                style={{ 
                  animation: `fadeInScale 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.1}s` 
                }}
              >
                <div className="relative h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity blur-xl`} />
                  <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      {useCase.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {useCase.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                    >
                      Explorar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;