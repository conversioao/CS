import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import modelPersona from "@/assets/model-persona.jpg";
import modelPulse from "@/assets/model-pulse.jpg";
import modelStyleAI from "@/assets/model-styleai.jpg";
import modelVision from "@/assets/model-vision.jpg";
import transformationExample1 from "@/assets/transformation-example-1.jpg";
import transformationExample2 from "@/assets/transformation-example-2.jpg";
import transformationExample3 from "@/assets/transformation-example-3.jpg";

const modelData = {
  persona: {
    name: "Conversio Studio — Persona",
    title: "Anúncios Autênticos com Pessoas Reais",
    description: "Cria anúncios autênticos com pessoas verdadeiras e produtos reais. Ideal para marcas que buscam conexão genuína com seu público.",
    image: modelPersona,
    exampleImage: transformationExample1,
    features: [
      "Criação de conteúdo UGC realista",
      "Pessoas e produtos autênticos",
      "Ideal para campanhas de conversão",
      "Otimizado para anúncios digitais",
      "Integração com produtos reais"
    ],
    tags: ["UGC", "Autêntico", "Realista"],
    color: "from-purple-500 to-pink-500"
  },
  pulse: {
    name: "Conversio Studio — Pulse",
    title: "Conteúdo Vibrante para Redes Sociais",
    description: "Transforma o teu conteúdo em anúncios vibrantes e cheios de vida. Perfeito para maximizar o engajamento nas redes sociais.",
    image: modelPulse,
    exampleImage: transformationExample3,
    features: [
      "Otimizado para redes sociais",
      "Conteúdo viral e engajador",
      "Efeitos visuais modernos",
      "Animações dinâmicas",
      "Maximiza o alcance orgânico"
    ],
    tags: ["Viral", "Engajamento", "Social Media"],
    color: "from-pink-500 to-red-500"
  },
  styleai: {
    name: "Conversio Studio — StyleAI",
    title: "Experimentação Digital de Moda",
    description: "Experimenta digitalmente as tuas roupas com realismo profissional. A solução perfeita para e-commerce de moda.",
    image: modelStyleAI,
    exampleImage: transformationExample3,
    features: [
      "Try-on digital profissional",
      "Realismo fotográfico",
      "Múltiplas poses e ângulos",
      "Ideal para e-commerce",
      "Reduz custos de produção"
    ],
    tags: ["Moda", "Tendências", "Editorial"],
    color: "from-blue-500 to-purple-500"
  },
  vision: {
    name: "Conversio Studio — Vision",
    title: "Efeitos Visuais Cinematográficos",
    description: "Cria anúncios com efeitos visuais dignos de cinema. Para campanhas premium que exigem máximo impacto visual.",
    image: modelVision,
    exampleImage: transformationExample3,
    features: [
      "VFX de nível cinematográfico",
      "Efeitos visuais avançados",
      "Ideal para campanhas premium",
      "Alto impacto visual",
      "Produção de alta qualidade"
    ],
    tags: ["VFX", "Cinematográfico", "Premium"],
    color: "from-green-500 to-blue-500"
  }
};

const ModelDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const model = slug ? modelData[slug as keyof typeof modelData] : null;

  if (!model) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Modelo não encontrado</h1>
          <Link to="/">
            <Button>Voltar à página inicial</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Coluna da Imagem */}
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={model.image} 
                alt={model.name}
                className="w-full h-auto object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${model.color} to-transparent opacity-20`} />
            </div>
          </div>

          {/* Coluna do Conteúdo */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {model.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                {model.name}
              </h1>
              <h2 className="text-2xl font-semibold mb-4">
                {model.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {model.description}
              </p>
            </div>

            <div className="bg-secondary/20 border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Funcionalidades</h3>
              <ul className="space-y-3">
                {model.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={`/generate?model=${encodeURIComponent(model.name)}`} className="flex-1">
                <Button size="lg" className="w-full gradient-primary">
                  <Sparkles className="w-5 h-5" />
                  Usar Este Modelo
                </Button>
              </Link>
              <Link to="/auth" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
              <p className="text-sm text-center">
                <strong>Comece grátis:</strong> Teste todos os modelos sem compromisso. 
                Créditos disponíveis após o cadastro.
              </p>
            </div>
          </div>
        </div>
          {/* Imagem Demonstrativa */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Veja o modelo em ação</h2>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video hover:scale-110 transition-transform duration-300">
              <img
                src={model.exampleImage}
                alt={`${model.name} Example`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
      </main>
    </div>
  );
};

export default ModelDetail;