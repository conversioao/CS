import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Dê vida às suas ideias
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Crie campanhas, anúncios e conteúdos com apenas um clique.
        </p>
        <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
          Experimentar Gratuitamente
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
