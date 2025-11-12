import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BrainCircuit } from 'lucide-react';
import logo from '@/assets/logo.png';

const loadingSteps = [
  "A preparar as ferramentas de IA...",
  "A calibrar os modelos criativos...",
  "A construir o seu estúdio digital...",
  "Quase pronto para a magia acontecer...",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % loadingSteps.length);
    }, 2500);

    const redirectTimeout = setTimeout(() => {
      navigate('/theme-selection');
    }, 10000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <div className="relative w-32 h-32 mb-8">
        <img src={logo} alt="Conversio Studio" className="w-16 h-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Loader2 className="absolute inset-0 w-32 h-32 text-primary/20 animate-spin-slow" />
        <BrainCircuit className="w-16 h-16 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-500">
        A configurar o seu espaço criativo...
      </h1>
      <p className="text-muted-foreground max-w-md transition-opacity duration-500 text-center">
        {loadingSteps[currentStep]}
      </p>
      
      <div className="mt-8 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;