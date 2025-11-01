import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

const HeroScrollSlider = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            setActiveIndex(index);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    slideRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      slideRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="absolute left-0 w-full md:w-1/2 h-full z-20 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {activeSlide.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                {activeSlide.description}
              </p>
              <Link to={activeSlide.link}>
                <Button size="lg" className="gradient-primary text-lg px-8 glow-effect">
                  {activeSlide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div style={{ x }} className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              ref={(el) => (slideRefs.current[index] = el)}
              data-index={index}
              className="w-screen h-screen flex items-center justify-end pr-4 md:pr-16"
            >
              <div className="w-full md:w-1/2 h-3/4 md:h-4/5">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroScrollSlider;