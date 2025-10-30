import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const slides = [
  {
    before: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    after: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    title: "Transforme produtos simples em anúncios profissionais",
  },
  {
    before: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
    after: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80",
    title: "IA profissional para seus anúncios de moda",
  },
  {
    before: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
    after: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    title: "Do produto ao anúncio em segundos",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

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
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
                Começar Agora
              </Button>
            </Link>
            <Link to="/models">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explorar Modelos
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Carousel */}
        <div className="relative mt-16 animate-scale-in">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
          
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-card/30 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full absolute inset-0"
                    : "opacity-0 translate-x-full absolute inset-0"
                }`}
              >
                <div className="grid md:grid-cols-2 gap-4 p-6">
                  {/* Antes */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative">
                      <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                        Antes
                      </div>
                      <img
                        src={slide.before}
                        alt="Antes"
                        className="w-full aspect-square object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  
                  {/* Depois */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-primary/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative">
                      <div className="absolute top-3 left-3 z-10 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                        Depois
                      </div>
                      <img
                        src={slide.after}
                        alt="Depois"
                        className="w-full aspect-square object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-4 px-6">
                  <h3 className="text-xl font-bold gradient-text">{slide.title}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
