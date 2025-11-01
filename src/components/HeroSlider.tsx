import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
    link: "/model/persona",
    gradientColors: "from-purple-500/20 to-pink-500/20",
  },
  {
    image: heroPulse,
    title: "Conteúdo Vibrante para Redes Sociais",
    description: "Transforme suas ideias em anúncios cheios de vida, otimizados para engajamento viral.",
    cta: "Explorar Modelo Pulse",
    link: "/model/pulse",
    gradientColors: "from-red-500/20 to-orange-500/20",
  },
  {
    image: heroStyle,
    title: "Moda e Estilo com Realismo Digital",
    description: "Experimente roupas e acessórios com nosso modelo de IA especializado em moda.",
    cta: "Explorar Modelo StyleAI",
    link: "/model/styleai",
    gradientColors: "from-blue-500/20 to-indigo-500/20",
  },
  {
    image: heroVision,
    title: "Efeitos Visuais de Cinema",
    description: "Produza anúncios com qualidade cinematográfica e impacto visual inesquecível.",
    cta: "Explorar Modelo Vision",
    link: "/model/vision",
    gradientColors: "from-teal-500/20 to-green-500/20",
  },
];

const imageVariants: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } },
};

const textContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const textVariants: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(handleNext, 8000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${activeSlide.gradientColors} blur-3xl`}
        />
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-4xl mb-8"
          >
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            variants={textContainerVariants}
            initial="initial"
            animate="animate"
            className="text-center max-w-3xl"
          >
            <motion.h1 variants={textVariants} className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {activeSlide.title}
            </motion.h1>
            <motion.p variants={textVariants} className="text-lg text-muted-foreground mb-8">
              {activeSlide.description}
            </motion.p>
            <motion.div variants={textVariants}>
              <Link to={activeSlide.link}>
                <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
                  {activeSlide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-card/50 hover:bg-card p-3 rounded-full transition-all duration-300 border border-border"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-card/50 hover:bg-card p-3 rounded-full transition-all duration-300 border border-border"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`transition-all duration-500 rounded-full ${
              index === activeIndex
                ? "w-8 h-3 bg-primary shadow-lg shadow-primary/50"
                : "w-3 h-3 bg-muted hover:bg-muted-foreground/50"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;