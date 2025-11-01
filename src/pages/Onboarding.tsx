import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BrainCircuit, Palette, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';
import WelcomeModal from '@/components/WelcomeModal';
import DashboardTutorial from '@/components/DashboardTutorial';

const Onboarding = () => {
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Verificar se o utilizador é novo e verificado
    const isNewUser = localStorage.getItem('isNewUser');
    const userVerified = localStorage.getItem('userVerified');
    
    if (isNewUser === 'true' && userVerified === 'true') {
      setShowWelcomeModal(true);
      setIsVerified(true);
    } else {
      // Se não for novo ou não estiver verificado, ir diretamente para o dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    setShowTutorial(true);
  };

  const handleFinishTutorial = () => {
    setShowTutorial(false);
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('userVerified');
    navigate('/dashboard');
  };

  return (
    <>
      {showWelcomeModal && (
        <WelcomeModal 
          isOpen={showWelcomeModal} 
          onClose={handleCloseModal}
          isVerified={isVerified}
        />
      )}
      {showTutorial && <DashboardTutorial onFinish={handleFinishTutorial} />}

      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <img src={logo} alt="Conversio Studio" className="h-16 w-auto mb-12 animate-pulse" />
        
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <Loader2 className="w-48 h-48 text-primary/20 animate-spin-slow" />
          <BrainCircuit className="w-24 h-24 text-primary absolute animate-pulse" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white transition-all duration-500">
          A configurar o seu espaço criativo...
        </h1>
        <p className="text-muted-foreground max-w-md">
          Estamos preparando tudo para que você possa criar anúncios incríveis. Isso pode levar alguns segundos.
        </p>
      </div>
    </>
  );
};

export default Onboarding;