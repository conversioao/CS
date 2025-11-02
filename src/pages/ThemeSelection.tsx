import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

const ThemeSelection = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark');

  const handleSelectTheme = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    setTheme(theme);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <img src={logo} alt="Conversio Studio" className="h-12 w-auto mb-8" />
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Escolha a sua aparência</h1>
        <p className="text-muted-foreground">Personalize a sua experiência no Conversio Studio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-12">
        <Card
          onClick={() => handleSelectTheme('light')}
          className={cn(
            "cursor-pointer transition-all duration-300 relative p-6 text-center",
            selectedTheme === 'light' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'
          )}
        >
          {selectedTheme === 'light' && <CheckCircle className="w-6 h-6 text-primary absolute top-4 right-4" />}
          <CardContent className="p-0">
            <Sun className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold">Modo Claro</h3>
          </CardContent>
        </Card>
        <Card
          onClick={() => handleSelectTheme('dark')}
          className={cn(
            "cursor-pointer transition-all duration-300 relative p-6 text-center",
            selectedTheme === 'dark' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'
          )}
        >
          {selectedTheme === 'dark' && <CheckCircle className="w-6 h-6 text-primary absolute top-4 right-4" />}
          <CardContent className="p-0">
            <Moon className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold">Modo Escuro</h3>
          </CardContent>
        </Card>
      </div>

      <Button size="lg" className="gradient-primary" onClick={handleContinue}>
        Continuar para o Painel
      </Button>
    </div>
  );
};

export default ThemeSelection;