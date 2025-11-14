import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const tutorialSteps = [
 {
 elementId: 'tools-section',
 title: 'Ferramentas Principais',
 description: 'Aqui você encontra todas as nossas ferramentas de IA para gerar imagens, vídeos e muito mais.',
 position: 'bottom',
 },
 {
 elementId: 'recent-creations-section',
 title: 'Criações Recentes',
 description: 'Suas últimas8 criações aparecerão aqui para acesso rápido.',
 position: 'top',
 },
 {
 elementId: 'dashboard-nav-credits',
 title: 'Seus Créditos',
 description: 'Acompanhe seus créditos aqui. Cada ação consome créditos, então fique de olho!',
 position: 'bottom',
 },
 {
 elementId: 'dashboard-nav-account',
 title: 'Sua Conta',
 description: 'Acesse as configurações da sua conta e gerencie seu perfil aqui.',
 position: 'bottom',
 },
];

interface DashboardTutorialProps {
 onFinish: () => void;
}

const DashboardTutorial = ({ onFinish }: DashboardTutorialProps) => {
 const [stepIndex, setStepIndex] = useState(0);
 const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

 const currentStep = tutorialSteps[stepIndex];

 useEffect(() => {
 const updateHighlight = () => {
 const element = document.getElementById(currentStep.elementId);
 if (element) {
 const rect = element.getBoundingClientRect();
 setHighlightStyle({
 width: rect.width +20,
 height: rect.height +20,
 top: rect.top -10,
 left: rect.left -10,
 });
 }
 };

 const timer = setTimeout(updateHighlight,100);
 window.addEventListener('resize', updateHighlight);
 return () => {
 clearTimeout(timer);
 window.removeEventListener('resize', updateHighlight);
 };
 }, [currentStep]);

 const handleNext = () => {
 if (stepIndex < tutorialSteps.length -1) {
 setStepIndex(stepIndex +1);
 } else {
 onFinish();
 }
 };

 const handleSkip = () => {
 onFinish();
 };

 const getTooltipPosition = (): React.CSSProperties => {
 const top = (highlightStyle.top as number) ||0;
 const left = (highlightStyle.left as number) ||0;
 const width = (highlightStyle.width as number) ||0;
 const height = (highlightStyle.height as number) ||0;

 if (currentStep.position === 'bottom') {
 return { top: top + height +10, left: left + width /2 -160 };
 }
 return { top: top -10, left: left + width /2 -160, transform: 'translateY(-100%)' };
 };

 return (
 <div className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm">
 <div className="absolute bg-transparent rounded-lg border-2 border-dashed border-primary transition-all duration-300 pointer-events-none"
 style={highlightStyle}
 />
 <div className="absolute bg-card p-6 rounded-lg shadow-2xl w-80 z-[101] transition-all duration-300"
 style={getTooltipPosition()}
 >
 <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
 <p className="text-sm text-muted-foreground mb-4">{currentStep.description}</p>
 <div className="flex justify-between items-center">
 <span className="text-xs text-muted-foreground">{stepIndex +1} / {tutorialSteps.length}</span>
 <Button onClick={handleNext} size="sm">
 {stepIndex === tutorialSteps.length -1 ? 'Finalizar' : 'Próximo'}
 </Button>
 </div>
 </div>

 <Button variant="ghost"
 size="icon"
 className="absolute top-4 right-4 text-white hover:bg-white/10"
 onClick={handleSkip}
 >
 <X className="w-5 h-5" />
 </Button>
 </div>
 );
};

export default DashboardTutorial;