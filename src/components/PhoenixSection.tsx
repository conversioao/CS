import { Button } from "@/components/ui/button";
import adExample1 from "@/assets/ad-example-1.jpg";
import adExample2 from "@/assets/ad-example-2.jpg";

const PhoenixSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conversio Phoenix — o modelo que entende o seu produto
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Um modelo de IA otimizado para gerar anúncios autênticos, com cores, ângulos e estilos que capturam a atenção do seu público.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Nosso modelo Phoenix foi treinado especificamente para entender contextos de marketing e publicidade, gerando não apenas imagens bonitas, mas anúncios que convertem.
            </p>
            <Button size="lg" className="gradient-primary">
              Testar Modelo Phoenix
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <img 
              src={adExample1} 
              alt="Phoenix Example 1" 
              className="rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
            <img 
              src={adExample2} 
              alt="Phoenix Example 2" 
              className="rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhoenixSection;
