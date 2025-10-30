import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.jpg";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Crie anúncios poderosos com o{" "}
            <span className="gradient-text">Conversio Studio</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gere anúncios prontos para redes sociais a partir de uma simples imagem com inteligência artificial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
              Gerar Anúncio com IA
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Explorar Modelos
            </Button>
          </div>
        </div>
        
        <div className="relative mt-16 animate-scale-in">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
          <img 
            src={heroMockup} 
            alt="Conversio Studio Dashboard" 
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl relative z-10"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
