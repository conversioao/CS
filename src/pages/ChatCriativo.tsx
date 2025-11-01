import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Send, Loader2, Upload, Sparkles, Image as ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// --- Tipos ---
interface Message {
  id: number;
  sender: "user" | "ai" | "system";
  type: "text" | "image_prompt" | "input_prompt" | "campaign_plan";
  content: any;
}

interface CampaignPlan {
  plano_7_dias: { dia: number; tema: string; copy: string; variacoes_copy: string[] }[];
  descricao_curta_imagem: string;
  hashtags: string[];
  modelo_sugerido: string;
  melhorias_produto?: { baixa_resolucao?: string; fundo_confuso?: string };
}

// --- Componente Principal ---
const ChatCriativo = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState<any>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chatFlow = [
    { id: "start", sender: "ai" as const, type: "text" as const, content: "Olá! Vamos criar uma campanha de marketing incrível. Para começar, por favor, envie uma imagem do seu produto." },
    { id: "image", sender: "user" as const, type: "image_prompt" as const, content: null },
    { id: "name", sender: "ai" as const, type: "input_prompt" as const, content: { key: "productName", label: "Qual é o nome do produto?" } },
    { id: "audience", sender: "ai" as const, type: "input_prompt" as const, content: { key: "targetAudience", label: "Para quem é este produto? (Público-alvo)", multiline: true } },
    { id: "platform", sender: "ai" as const, type: "input_prompt" as const, content: { key: "socialMedia", label: "Para qual rede social é o anúncio?", options: ["Instagram", "Facebook", "TikTok", "LinkedIn"] } },
    { id: "style", sender: "ai" as const, type: "input_prompt" as const, content: { key: "adStyle", label: "Qual estilo de anúncio você prefere?", options: ["Moderno e Minimalista", "Vibrante e Energético", "Elegante e Sofisticado"] } },
    { id: "budget", sender: "ai" as const, type: "input_prompt" as const, content: { key: "budget", label: "Qual é o seu orçamento (opcional)?" } },
    { id: "end", sender: "ai" as const, type: "text" as const, content: "Ótimo! Tenho todas as informações. A gerar o seu plano de marketing..." },
  ];

  useEffect(() => {
    if (messages.length === 0) {
      const { id, ...firstStep } = chatFlow[0];
      setMessages([{ ...firstStep, id: Date.now() }]);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (newMessage: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...newMessage, id: Date.now() }]);
  };

  const handleNextStep = (key: string, value: any) => {
    const updatedInput = { ...userInput, [key]: value };
    setUserInput(updatedInput);

    addMessage({ sender: "user", type: "text", content: value });

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < chatFlow.length) {
      setCurrentStep(nextStepIndex);
      const { id, ...nextStep } = chatFlow[nextStepIndex];
      setTimeout(() => addMessage(nextStep), 500);
    }

    if (chatFlow[nextStepIndex].id === "end") {
      generateCampaign(updatedInput);
    }
  };

  const handleImageUpload = (file: File) => {
    // 5. Checagens no Front-end
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({ title: "Erro", description: "A imagem é muito grande. O máximo é 5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 1200 || img.height < 1200) {
          toast({ title: "Aviso", description: "Para melhores resultados, recomendamos imagens com pelo menos 1200x1200 pixels." });
        }
        const imageUrl = e.target?.result as string;
        handleNextStep("imageUrl", imageUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const generateCampaign = async (finalUserInput: any) => {
    setIsLoading(true);
    try {
      // Simulação de chamada à API e ao webhook n8n
      // Em um app real: const response = await fetch('/api/chat-criativo', { method: 'POST', body: JSON.stringify(finalUserInput) });
      // const campaignPlan = await response.json();
      
      // 6. Exemplo de Payload (Resposta do Agente)
      const mockCampaignPlan: CampaignPlan = {
        plano_7_dias: Array.from({ length: 7 }, (_, i) => ({
          dia: i + 1,
          tema: `Tema Criativo do Dia ${i + 1}`,
          copy: `Esta é a copy principal para o dia ${i + 1} sobre ${finalUserInput.productName}.`,
          variacoes_copy: [`Variação 1 para o dia ${i + 1}`, `Variação 2 para o dia ${i + 1}`]
        })),
        descricao_curta_imagem: `Um anúncio de ${finalUserInput.adStyle} para ${finalUserInput.productName}, perfeito para ${finalUserInput.socialMedia}.`,
        hashtags: ["#marketingdigital", `#${finalUserInput.productName.replace(/\s/g, '')}`, "#sucesso"],
        modelo_sugerido: "Advision UGC",
        melhorias_produto: {
          baixa_resolucao: "A imagem parece ter baixa resolução. Tente uma imagem com maior qualidade para um resultado mais profissional."
        }
      };

      addMessage({ sender: "ai", type: "campaign_plan", content: mockCampaignPlan });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível gerar a campanha.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.type) {
      case "text":
        return <p>{msg.content}</p>;
      case "image_prompt":
        return <ImageUploader onUpload={handleImageUpload} disabled={isLoading} />;
      case "input_prompt":
        return <InputRenderer prompt={msg.content} onSumbit={handleNextStep} disabled={isLoading} />;
      case "campaign_plan":
        return <CampaignPlanDisplay plan={msg.content} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 relative">
          <div className="flex-1 flex flex-col bg-card/50 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
            <header className="p-4 border-b border-border/50 flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-bold">ChatCriativo de Marketing</h1>
            </header>
            <ScrollArea className="flex-1 p-6">
              <div ref={scrollAreaRef} className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex items-start gap-4 max-w-[85%]", message.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {message.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={cn("p-4 rounded-lg", message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))}
                {isLoading && <LoaderMessage />}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Componentes Auxiliares ---

const ImageUploader = ({ onUpload, disabled }: { onUpload: (file: File) => void, disabled: boolean }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };
  return (
    <div>
      <Input id="image-upload-chat" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={disabled} />
      <label htmlFor="image-upload-chat">
        <Button asChild disabled={disabled} className="cursor-pointer">
          <span><Upload className="w-4 h-4 mr-2" /> Carregar Imagem</span>
        </Button>
      </label>
    </div>
  );
};

const InputRenderer = ({ prompt, onSumbit, disabled }: { prompt: any, onSumbit: (key: string, value: string) => void, disabled: boolean }) => {
  const [value, setValue] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSumbit(prompt.key, value);
  };

  if (prompt.options) {
    return (
      <div className="space-y-2">
        <p className="font-semibold mb-2">{prompt.label}</p>
        <Select onValueChange={(val) => onSumbit(prompt.key, val)} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
          <SelectContent>{prompt.options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label>{prompt.label}</Label>
      {prompt.multiline ? (
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} />
      ) : (
        <Input value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} />
      )}
      <Button type="submit" size="sm" disabled={disabled || !value.trim()}>Enviar</Button>
    </form>
  );
};

const CampaignPlanDisplay = ({ plan }: { plan: CampaignPlan }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerateClick = () => {
    // 5. Checagens no Front-end
    if (plan.descricao_curta_imagem.length < 100 || plan.descricao_curta_imagem.length > 150) {
      toast({
        title: "Aviso de Validação",
        description: `A descrição para a imagem (${plan.descricao_curta_imagem.length} chars) está fora do ideal (100-150 chars). O resultado pode variar.`,
        variant: "default"
      });
    }
    navigate(`/generate?model=${encodeURIComponent(plan.modelo_sugerido)}&description=${encodeURIComponent(plan.descricao_curta_imagem)}`);
  };

  return (
    <Card className="bg-background border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Seu Plano de Marketing Criativo!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.melhorias_produto && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle size={16} /> Sugestões de Melhoria</h4>
            {Object.values(plan.melhorias_produto).map((sug, i) => <p key={i} className="text-sm mt-1">- {sug}</p>)}
          </div>
        )}
        <div>
          <h4 className="font-semibold flex items-center gap-2"><ImageIcon size={16} /> Para a Imagem</h4>
          <p className="text-sm text-muted-foreground mt-1"><strong>Modelo:</strong> {plan.modelo_sugerido}</p>
          <p className="text-sm text-muted-foreground"><strong>Descrição:</strong> {plan.descricao_curta_imagem}</p>
          <p className="text-sm text-muted-foreground"><strong>Hashtags:</strong> {plan.hashtags.join(' ')}</p>
        </div>
        <Button onClick={handleGenerateClick} className="w-full gradient-primary">
          <Sparkles className="w-4 h-4 mr-2" /> Gerar com Modelo Sugerido
        </Button>
      </CardContent>
    </Card>
  );
};

const LoaderMessage = () => (
  <div className="flex items-start gap-4 max-w-[85%] mr-auto">
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted"><Bot size={18} /></div>
    <div className="p-4 rounded-lg bg-muted flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /><span>Pensando...</span>
    </div>
  </div>
);

export default ChatCriativo;