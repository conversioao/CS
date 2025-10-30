import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80",
    title: "Transforme Produtos em Anúncios Profissionais",
    subtitle: "IA avançada para criar campanhas que convertem",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80",
    title: "Do Simples ao Extraordinário",
    subtitle: "Eleve suas imagens de produto com tecnologia de ponta",
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80",
    title: "Anúncios Que Chamam Atenção",
    subtitle: "Criação automática em segundos com resultados profissionais",
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
    }, 500);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 500);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-110 z-0"
          }`}
        >
          {/* Background Image with Parallax Effect */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ${
              index === currentSlide && !isTransitioning ? "scale-105" : "scale-100"
            }`}
            style={{ 
              backgroundImage: `url(${slide.image})`,
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <div className={`transition-all duration-1000 delay-300 ${
                index === currentSlide && !isTransitioning
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                  {slide.title.split(' ').map((word, i) => (
                    <span
                      key={i}
                      className="inline-block animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  {slide.subtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <Link to="/auth">
                    <Button size="lg" className="gradient-primary text-lg px-8 glow-effect hover-lift">
                      Começar Agora
                    </Button>
                  </Link>
                  <Link to="/models">
                    <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10 hover-lift">
                      Explorar Modelos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Border Effect */}
          <div className={`absolute inset-0 border-4 border-primary/0 transition-all duration-1000 ${
            index === currentSlide ? "border-primary/20" : ""
          }`} />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-custom-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
