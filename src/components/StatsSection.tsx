import { TrendingUp, Users, Zap, Star } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "10k+",
      label: "Usuários Ativos",
      description: "Criadores confiando em nossa plataforma"
    },
    {
      icon: Zap,
      value: "500k+",
      label: "Anúncios Criados",
      description: "Transformações realizadas com sucesso"
    },
    {
      icon: TrendingUp,
      value: "3x",
      label: "Mais Conversões",
      description: "Aumento médio de performance"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Avaliação",
      description: "Satisfação dos nossos usuários"
    }
  ];

  return (
    <section className="py-20 px-4 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-10 pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="stat-card text-center opacity-0"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.1}s` 
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-1">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;