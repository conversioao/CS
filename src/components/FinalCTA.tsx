import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Crie anúncios impressionantes agora
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Junte-se a milhares de criadores e empresas que já transformaram sua estratégia de marketing com IA.
        </p>
        <Button size="lg" className="gradient-primary text-lg px-12 glow-effect">
          Começar Agora
        </Button>
      </div>
    </section>
  );
};

export default FinalCTA;
