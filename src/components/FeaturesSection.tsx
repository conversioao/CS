import { Briefcase, Palette, Building2 } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Para Negócios",
    description: "Crie campanhas de produto automaticamente, otimizando seu tempo e recursos.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Para Criadores",
    description: "Melhore a presença nas redes sociais com designs profissionais e conteúdo viral.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Building2,
    title: "Para Agências",
    description: "Escale a criação de anúncios com fluxos automatizados e colaboração em equipe.",
    color: "from-green-500 to-teal-500",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transforme ideias simples em <span className="gradient-text">anúncios que vendem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa plataforma foi desenhada para atender às necessidades de diferentes perfis profissionais.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="relative p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border border-border/50 text-center"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.15}s` 
                }}
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;