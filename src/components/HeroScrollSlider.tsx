import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

const HeroScrollSlider = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${100 * (slides.length - 1)}%`]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const newIndex = Math.min(Math.floor(latest * slides.length), slides.length - 1);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, activeIndex]);

  const activeSlide = slides[activeIndex];

  return (
    <section ref={scrollRef} className="relative h-[400vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
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

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-20 md:pb-32 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl pointer-events-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {activeSlide.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {activeSlide.description}
              </p>
              <Link to={activeSlide.link}>
                <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
                  {activeSlide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div className="flex h-full" style={{ x }}>
          {slides.map((slide, index) => (
            <div key={index} className="w-screen h-screen flex items-center justify-center p-16">
              <motion.div 
                className="w-full h-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroScrollSlider;