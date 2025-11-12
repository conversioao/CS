import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare } from 'lucide-react';
import logo from '@/assets/logo.png';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    "A preparar as ferramentas de IA...",
    "A calibrar os modelos criativos...",
    "A construir o seu estúdio digital...",
    "Quase pronto para a magia acontecer...",
  ];

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
      <img src={logo} alt="Conversio Studio" className="h-16 w-auto mb-12 animate-pulse" />
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <Loader2 className="w-48 h-48 text-primary/20 animate-spin-slow" />
        <MessageSquare className="w-24 h-24 text-primary absolute animate-pulse" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-500">
        Código de Verificação Enviado!
      </h1>
      <p className="text-muted-foreground max-w-md transition-opacity duration-500">
        {loadingSteps[currentStep]}
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        Verifique o seu WhatsApp para obter o código de verificação.
      </p>
    </div>
  );
};

export default Onboarding;