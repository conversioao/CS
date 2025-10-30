import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80&fit=crop&crop=center",
    title: "Transforme Produtos",
    subtitle: "em Anúncios Profissionais",
    description: "IA avançada para criar campanhas que convertem em segundos",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&fit=crop&crop=center",
    title: "Do Simples",
    subtitle: "ao Extraordinário",
    description: "Eleve suas imagens de produto com tecnologia de ponta",
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fit=crop&crop=center",
    title: "Anúncios Que",
    subtitle: "Chamam Atenção",
    description: "Criação automática com resultados profissionais garantidos",
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
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-20 lg:py-0">
          {/* Conteúdo de Texto - Esquerda */}
          <div className="relative z-20 space-y-6 lg:space-y-8">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 absolute inset-0 translate-x-[-100px] pointer-events-none"
                }`}
              >
                {/* Título Animado */}
                <div className="space-y-2">
                  <h1 
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight transition-all duration-700 delay-100 ${
                      index === currentSlide && !isTransitioning
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <h2 
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text leading-tight transition-all duration-700 delay-200 ${
                      index === currentSlide && !isTransitioning
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                  >
                    {slide.subtitle}
                  </h2>
                </div>

                {/* Descrição */}
                <p 
                  className={`text-lg sm:text-xl md:text-2xl text-gray-300 max-w-xl transition-all duration-700 delay-300 ${
                    index === currentSlide && !isTransitioning
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  {slide.description}
                </p>

                {/* Botões CTA */}
                <div 
                  className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 delay-400 ${
                    index === currentSlide && !isTransitioning
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <Link to="/auth">
                    <Button size="lg" className="gradient-primary text-lg px-8 py-6 glow-effect hover-lift w-full sm:w-auto">
                      Começar Agora
                    </Button>
                  </Link>
                  <Link to="/models">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 hover-lift w-full sm:w-auto"
                    >
                      Explorar Modelos
                    </Button>
                  </Link>
                </div>

                {/* Linha Decorativa Animada */}
                <div 
                  className={`h-1 bg-gradient-to-r from-primary via-accent to-transparent rounded-full transition-all duration-1000 delay-500 ${
                    index === currentSlide && !isTransitioning
                      ? "opacity-100 w-64"
                      : "opacity-0 w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Imagem - Direita */}
          <div className="relative lg:h-[600px] h-[400px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === currentSlide
                    ? "opacity-100 scale-100 rotate-0"
                    : index < currentSlide
                    ? "opacity-0 scale-90 -rotate-12"
                    : "opacity-0 scale-90 rotate-12"
                }`}
              >
                {/* Container com forma especial */}
                <div className="relative w-full h-full">
                  {/* Efeito de brilho de fundo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-[3rem] blur-3xl animate-pulse" />
                  
                  {/* Imagem com formato especial */}
                  <div 
                    className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl transform transition-transform duration-1000 hover:scale-105"
                    style={{
                      clipPath: "polygon(10% 0%, 100% 0%, 100% 85%, 90% 100%, 0% 100%, 0% 15%)",
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay com gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 mix-blend-overlay" />
                    
                    {/* Borda animada */}
                    <div 
                      className={`absolute inset-0 border-4 border-primary/0 transition-all duration-1000 rounded-[3rem] ${
                        index === currentSlide ? "border-primary/30" : ""
                      }`}
                      style={{
                        clipPath: "polygon(10% 0%, 100% 0%, 100% 85%, 90% 100%, 0% 100%, 0% 15%)",
                      }}
                    />
                  </div>

                  {/* Elementos decorativos flutuantes */}
                  <div 
                    className={`absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl transition-all duration-1000 ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  />
                  <div 
                    className={`absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl transition-all duration-1000 delay-200 ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  />
                </div>
              </div>
            ))}
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
