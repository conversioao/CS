import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles, Gift, Zap } from 'lucide-react';
import logo from '@/assets/logo.png';
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect após 8 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const features = [
    { icon: Sparkles, text: 'Gere imagens incríveis com IA' },
    { icon: Zap, text: 'Crie vídeos profissionais' },
    { icon: Gift, text: '100 créditos grátis para começar' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl relative z-10 bg-card/50 backdrop-blur-xl border-border/50 overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_3s_infinite] opacity-50" />
          <div className="absolute inset-[1px] bg-card rounded-lg" />
          
          <CardHeader className="text-center relative z-10 pt-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <img src={logo} alt="Conversio Studio" className="h-16 w-auto mx-auto mb-6" />
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
              className="relative inline-block mx-auto mb-6"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/50">
                <CheckCircle className="w-20 h-20 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CardTitle className="text-4xl mb-4">
                Bem-vindo ao <span className="gradient-text">Conversio Studio</span>!
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="text-center space-y-8 relative z-10 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-500">Conta Verificada com Sucesso!</span>
              </div>

              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Parabéns! Sua conta foi verificada e você recebeu{' '}
                <span className="font-bold text-primary">100 créditos grátis</span> para começar sua jornada criativa.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="grid gap-4 max-w-md mx-auto"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center gap-4 bg-secondary/30 rounded-lg p-4 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-left">{feature.text}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="space-y-4"
            >
              <Button 
                size="lg" 
                className="gradient-primary glow-effect text-lg px-8"
                onClick={() => navigate('/dashboard')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Começar a Criar Agora
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Você será redirecionado automaticamente em alguns segundos...
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Welcome;