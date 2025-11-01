import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroPersona from "@/assets/hero-persona.jpg";
import heroPulse from "@/assets/hero-pulse.jpg";
import heroStyle from "@/assets/hero-style.jpg";
import heroVision from "@/assets/hero-vision.jpg";

const slides = [
  {
    image: heroPersona,
    title: "Anúncios Autênticos com IA",
    description: "Crie conteúdo UGC realista que conecta com seu público e gera resultados reais.",
    cta: "Explorar Modelo Persona",
    link: "/model/persona"
  },
  {
    image: heroPulse,
    title: "Conteúdo Vibrante para Redes Sociais",
    description: "Transforme suas ideias em anúncios cheios de vida, otimizados para engajamento viral.",
    cta: "Explorar Modelo Pulse",
    link: "/model/pulse"
  },
  {
    image: heroStyle,
    title: "Moda e Estilo com Realismo Digital",
    description: "Experimente roupas e acessórios com nosso modelo de IA especializado em moda.",
    cta: "Explorar Modelo StyleAI",
    link: "/model/styleai"
  },
  {
    image: heroVision,
    title: "Efeitos Visuais de Cinema",
    description: "Produza anúncios com qualidade cinematográfica e impacto visual inesquecível.",
    cta: "Explorar Modelo Vision",
    link: "/model/vision"
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const textVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
};

const HeroSlider = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([(page + newDirection + slides.length) % slides.length, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(timer);
  }, [page]);

  const slide = slides[page];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-20 pb-10 md:pt-0 md:pb-0">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Content */}
        <div className="text-center md:text-left">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                {slide.description}
              </p>
              <Link to={slide.link}>
                <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
                  {slide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Image Slider */}
        <div className="relative h-[300px] md:h-[500px] w-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              className="absolute inset-0 w-full h-full"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{ perspective: "1000px" }}
            >
              <motion.img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  rotateX: 10,
                  rotateY: -10,
                  boxShadow: "0px 20px 40px rgba(0,0,0,0.3)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <button
          onClick={() => paginate(-1)}
          className="bg-card/50 hover:bg-card backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group border border-border"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setPage([index, index > page ? 1 : -1])}
              className={`transition-all duration-500 rounded-full ${
                index === page
                  ? "w-8 h-3 bg-primary shadow-lg shadow-primary/50"
                  : "w-3 h-3 bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          className="bg-card/50 hover:bg-card backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group border border-border"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </section>
  );
};

export default HeroSlider;