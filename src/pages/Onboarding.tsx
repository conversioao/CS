import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

const Onboarding = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { message: 'Estamos criando seu studio...', duration: 2000 },
    { message: 'Aguarde...', duration: 1000 },
  ];

  useEffect(() => {
    // Fade in effect
    setIsVisible(true);

    let stepTimer: NodeJS.Timeout;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    steps.forEach((step, index) => {
      stepTimer = setTimeout(() => {
        setCurrentStep(index + 1);
      }, steps.slice(0, index).reduce((sum, s) => sum + s.duration, 0));
    });

    // Redirect after all steps are complete
    const redirectTimer = setTimeout(async () => {
      // Mark onboarding as completed in the database
      if (user) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
          
          if (error) {
            console.error('Error updating onboarding status:', error);
          }
        } catch (error) {
          console.error('Error updating onboarding status:', error);
        }
      }
      navigate('/dashboard');
    }, totalDuration);

    return () => {
      clearTimeout(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, user]);

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 p-8 max-w-md w-full text-center animate-scale-in">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Pulsing background circle */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
          Bem-vindo ao Conversio Studio!
        </h1>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Conta Verificada</span>
            </div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {currentStep < steps.length ? steps[currentStep].message : 'Preparando seu ambiente...'}
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;