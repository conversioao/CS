import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BrainCircuit, Palette, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

const loadingSteps = [
  { text: 'Configurando seu espaço criativo...', icon: Palette },
  { text: 'Calibrando os modelos de IA para você...', icon: BrainCircuit },
  { text: 'Polindo os pixels e preparando a magia...', icon: Sparkles },
  { text: 'Quase pronto! Sua jornada criativa começa agora.', icon: Sparkles },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prevStep => {
        if (prevStep < loadingSteps.length - 1) {
          return prevStep + 1;
        }
        clearInterval(stepInterval);
        return prevStep;
      });
    }, 3500);

    const redirectTimeout = setTimeout(() => {
      navigate('/dashboard');
    }, 15000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const Icon = loadingSteps[currentStep].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <img src={logo} alt="Conversio Studio" className="h-16 w-auto mb-12 animate-pulse" />
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <Loader2 className="w-48 h-48 text-primary/20 animate-spin-slow" />
        <Icon className="w-24 h-24 text-primary absolute animate-pulse" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white transition-all duration-500">
        {loadingSteps[currentStep].text}
      </h1>
      <p className="text-muted-foreground max-w-md">
        Estamos preparando tudo para que você possa criar anúncios incríveis. Isso pode levar alguns segundos.
      </p>
    </div>
  );
};

export default Onboarding;