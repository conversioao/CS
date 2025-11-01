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
    // Change loading message every 2.5 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % loadingSteps.length);
    }, 2500);

    // Redirect after 10 seconds
    const redirectTimeout = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <img src={logo} alt="Conversio Studio" className="h-16 w-auto mb-12 animate-pulse" />
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <Loader2 className="w-48 h-48 text-primary/20 animate-spin-slow" />
        <BrainCircuit className="w-24 h-24 text-primary absolute animate-pulse" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white transition-all duration-500">
        A configurar o seu espaço criativo...
      </h1>
      <p className="text-muted-foreground max-w-md transition-opacity duration-500">
        {loadingSteps[currentStep]}
      </p>
    </div>
  );
};

export default Onboarding;