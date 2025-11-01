import { ShoppingBag, Video, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const UseCasesSection = () => {
  const useCases = [
    {
      icon: ShoppingBag,
      title: "E-commerce",
      description: "Transforme fotos de produtos em anúncios que vendem. Crie banners para suas lojas online em minutos.",
      features: ["Banners de produtos", "Anúncios de promoções", "Stories de lançamento"],
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Video,
      title: "Redes Sociais",
      description: "Crie conteúdo visual impactante para Instagram, Facebook e TikTok com modelos otimizados.",
      features: ["Posts e stories", "Reels e shorts", "Anúncios pagos"],
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Image,
      title: "Marketing Digital",
      description: "Produza campanhas completas com múltiplas variações de anúncios em alta qualidade.",
      features: ["A/B testing visual", "Campanhas sazonais", "Retargeting criativo"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Sparkles,
      title: "Conteúdo UGC",
      description: "Dê vida ao seu conteúdo gerado por usuários com efeitos profissionais e edições rápidas.",
      features: ["Depoimentos visuais", "Reviews em vídeo", "Casos de sucesso"],
      color: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Perfeito para <span className="gradient-text">Todo Negócio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seja você um empreendedor solo ou uma agência, temos as ferramentas certas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={index}
                className="relative p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-2"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.15}s` 
                }}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`} />
                
                {/* Border effect on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex flex-col h-full">
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {useCase.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {useCase.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto bg-transparent border-border group-hover:border-primary group-hover:text-primary transition-colors"
                  >
                    Explorar
                  </Button>
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