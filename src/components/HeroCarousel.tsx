import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroPersona from "@/assets/hero-persona.jpg";
import heroPulse from "@/assets/hero-pulse.jpg";
import heroStyle from "@/assets/hero-style.jpg";
import heroVision from "@/assets/hero-vision.jpg";

const slides = [
  {
    image: heroPersona,
    alt: "Conversio Studio - Persona: Anúncios autênticos com pessoas reais"
  },
  {
    image: heroPulse,
    alt: "Conversio Studio - Pulse: Conteúdo vibrante para redes sociais"
  },
  {
    image: heroStyle,
    alt: "Conversio Studio - StyleAI: Experimentação digital profissional"
  },
  {
    image: heroVision,
    alt: "Conversio Studio - Vision: Efeitos visuais cinematográficos"
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 10000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 600);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 600);
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 600);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Slider de Fundo com Imagens Completas */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            {/* Overlay escuro para melhorar legibilidade */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Gradientes decorativos */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-accent/30 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
          </div>
        ))}
      </div>

      {/* Elementos decorativos futuristas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-20 bg-gradient-to-b from-primary to-transparent opacity-60 animate-pulse" />
        <div className="absolute top-40 right-20 w-2 h-32 bg-gradient-to-b from-accent to-transparent opacity-60 animate-pulse delay-300" />
        <div className="absolute bottom-40 left-1/4 w-32 h-2 bg-gradient-to-r from-primary to-transparent opacity-60 animate-pulse delay-700" />
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center relative z-10">
        <div className="w-full flex flex-col justify-center items-center text-center py-20">
          <div className="max-w-5xl">
            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-lg px-10 py-7 glow-effect hover-lift w-full sm:w-auto text-white font-semibold shadow-2xl">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/models">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-7 border-2 border-white/40 text-white hover:bg-white/20 hover-lift w-full sm:w-auto backdrop-blur-sm font-semibold"
                >
                  Ver Modelos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Navegação */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <button
          onClick={handlePrev}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
        </button>

        {/* Indicadores */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? "w-12 h-3 bg-primary shadow-lg shadow-primary/50"
                  : "w-3 h-3 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden lg:block">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-custom-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
