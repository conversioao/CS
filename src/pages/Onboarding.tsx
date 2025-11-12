import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const Onboarding = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    setIsVisible(true);

    // Redirect after 5 seconds
    const redirectTimeout = setTimeout(() => {
      navigate('/theme-selection');
    }, 5000);

    return () => clearTimeout(redirectTimeout);
  }, [navigate]);

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 p-8 max-w-md w-full text-center animate-scale-in">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Pulsing background circle */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
          Código Enviado!
        </h1>
        <p className="text-muted-foreground mb-6">
          Enviamos o código de verificação para o seu WhatsApp. Por favor, verifique sua mensagem.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Aguarde alguns instantes...</span>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full bg-primary"
                style={{
                  animation: `pulse 1.5s infinite ${dot * 0.3}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;