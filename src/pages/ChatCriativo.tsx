import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Upload, Sparkles, Image as ImageIcon, AlertTriangle, Copy, PlusCircle, ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

// --- Tipos ---
interface CampaignData {
  imageUrl?: string;
  productName?: string;
  targetAudience?: string;
  socialMedia?: string;
  adStyle?: string;
}

interface CampaignPlan {
  plano_7_dias: { dia: number; tema: string; copy: string; variacoes_copy: string[] }[];
  descricao_curta_imagem: string;
  hashtags: string[];
  modelo_sugerido: string;
  melhorias_produto?: { baixa_resolucao?: string; fundo_confuso?: string };
}

const mockCampaigns = [
  { id: 1, productName: 'Tênis Voador', createdAt: '28 de Out, 2024', status: 'Concluído', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { id: 2, productName: 'Relógio Futurista', createdAt: '25 de Out, 2024', status: 'Concluído', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
  { id: 3, productName: 'Sumo de Múcua Energético', createdAt: '22 de Out, 2024', status: 'Concluído', imageUrl: 'https://images.unsplash.com/photo-1575429239283-4763a9b2b267?w=400&h=400&fit=crop' },
];

// --- Componente Principal ---
const ChatCriativo = () => {
  const [view, setView] = useState<'list' | 'wizard'>('list');
  const [wizardStep, setWizardStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({});
  const [generatedPlan, setGeneratedPlan] = useState<CampaignPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNewCampaign = () => {
    setCampaignData({});
    setGeneratedPlan(null);
    setWizardStep(1);
    setView('wizard');
  };

  const handleBackToList = () => {
    setView('list');
  };

  const handleNextStep = () => {
    setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleImageUpload = (file: File) => {
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
        setCampaignData(prev => ({ ...prev, imageUrl: e.target?.result as string }));
        handleNextStep();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const generateCampaign = async () => {
    setIsLoading(true);
    setWizardStep(4); // Etapa de carregamento
    try {
      const dataToSend = { ...campaignData };

      if (dataToSend.imageUrl && dataToSend.imageUrl.startsWith('data:image')) {
        toast({ title: "Processando imagem...", description: "A carregar a imagem do produto para análise." });

        const response = await fetch(dataToSend.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "product-image.png", { type: blob.type });

        const formData = new FormData();
        formData.append('image', file);

        const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', {
          method: 'POST',
          body: formData,
        });

        if (!imgbbResponse.ok) {
          throw new Error('Erro ao fazer upload da imagem para o ImgBB.');
        }

        const imgbbData = await imgbbResponse.json();
        if (!imgbbData.data || !imgbbData.data.url) {
            throw new Error('Resposta inválida do ImgBB.');
        }
        
        dataToSend.imageUrl = imgbbData.data.url;
      }

      const webhookResponse = await fetch('https://n8n.conversio.ao/webhook-test/chatcriativo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!webhookResponse.ok) {
        throw new Error('A resposta do servidor não foi bem-sucedida.');
      }

      const campaignPlan: CampaignPlan = await webhookResponse.json();
      
      if (!campaignPlan.plano_7_dias || !campaignPlan.descricao_curta_imagem) {
        throw new Error('A resposta do webhook está mal formatada.');
      }

      setGeneratedPlan(campaignPlan);
      setWizardStep(5); // Etapa de resultados
    } catch (error) {
      console.error("Erro ao gerar campanha:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível gerar a campanha.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
      setWizardStep(3); // Volta para a etapa anterior em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1: // Upload de Imagem
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Passo 1: Imagem do Produto</h2>
            <p className="text-muted-foreground mb-6">Envie uma imagem de alta qualidade do seu produto.</p>
            <Input id="image-upload-wizard" type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
            <label htmlFor="image-upload-wizard" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-semibold">Clique para carregar ou arraste e solte</p>
              <p className="text-sm text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
            </label>
          </div>
        );
      case 2: // Detalhes do Produto
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Passo 2: Detalhes do Produto</h2>
            <p className="text-muted-foreground mb-6">Conte-nos mais sobre o que estamos a promover.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Nome do Produto</Label>
                <Input id="productName" value={campaignData.productName || ''} onChange={(e) => setCampaignData(p => ({ ...p, productName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="targetAudience">Público-alvo</Label>
                <Textarea id="targetAudience" value={campaignData.targetAudience || ''} onChange={(e) => setCampaignData(p => ({ ...p, targetAudience: e.target.value }))} />
              </div>
            </div>
          </div>
        );
      case 3: // Detalhes da Campanha
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Passo 3: Detalhes da Campanha</h2>
            <p className="text-muted-foreground mb-6">Defina o estilo e o foco da sua campanha.</p>
            <div className="space-y-4">
              <div>
                <Label>Rede Social</Label>
                <Select value={campaignData.socialMedia} onValueChange={(val) => setCampaignData(p => ({ ...p, socialMedia: val }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a rede social" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estilo do Anúncio</Label>
                <Select value={campaignData.adStyle} onValueChange={(val) => setCampaignData(p => ({ ...p, adStyle: val }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o estilo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Moderno e Minimalista">Moderno e Minimalista</SelectItem>
                    <SelectItem value="Vibrante e Energético">Vibrante e Energético</SelectItem>
                    <SelectItem value="Elegante e Sofisticado">Elegante e Sofisticado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 4: // Carregando
        return (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold">A gerar a sua campanha...</h2>
            <p className="text-muted-foreground">A nossa IA está a preparar um plano incrível para si.</p>
          </div>
        );
      case 5: // Resultados
        return generatedPlan ? <CampaignPlanDisplay plan={generatedPlan} /> : null;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (wizardStep === 2 && !campaignData.productName) return true;
    if (wizardStep === 3 && (!campaignData.socialMedia || !campaignData.adStyle)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {view === 'list' ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
                <Button onClick={handleNewCampaign}><PlusCircle className="w-4 h-4 mr-2" /> Criar Nova Campanha</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCampaigns.map(campaign => (
                  <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <img src={campaign.imageUrl} alt={campaign.productName} className="w-full h-40 object-cover" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{campaign.productName}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.createdAt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Button variant="ghost" onClick={handleBackToList} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Campanhas</Button>
              <Card className="max-w-3xl mx-auto">
                <CardContent className="p-8 min-h-[400px] flex flex-col justify-between">
                  {renderWizardStep()}
                  {wizardStep > 1 && wizardStep < 4 && (
                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={handlePrevStep}>Voltar</Button>
                      <Button onClick={wizardStep === 3 ? generateCampaign : handleNextStep} disabled={isNextDisabled()}>
                        {wizardStep === 3 ? 'Gerar Campanha' : 'Próximo'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Componente de Exibição do Plano ---
const CampaignPlanDisplay = ({ plan }: { plan: CampaignPlan }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerateClick = () => {
    if (plan.descricao_curta_imagem.length < 100 || plan.descricao_curta_imagem.length > 150) {
      toast({
        title: "Aviso de Validação",
        description: `A descrição para a imagem (${plan.descricao_curta_imagem.length} chars) está fora do ideal (100-150 chars). O resultado pode variar.`,
      });
    }
    navigate(`/generate?model=${encodeURIComponent(plan.modelo_sugerido)}&description=${encodeURIComponent(plan.descricao_curta_imagem)}`);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "O texto foi copiado para a área de transferência." });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Seu Plano de Marketing Criativo!</h2>
        <p className="text-muted-foreground">Aqui está a estratégia que a IA preparou para si.</p>
      </div>
      {plan.melhorias_produto && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
          <h4 className="font-semibold flex items-center gap-2"><AlertTriangle size={16} /> Sugestões de Melhoria</h4>
          {Object.values(plan.melhorias_produto).map((sug, i) => <p key={i} className="text-sm mt-1">- {sug}</p>)}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon size={16} /> Para a Imagem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm"><strong className="text-foreground">Modelo:</strong> {plan.modelo_sugerido}</p>
          <p className="text-sm"><strong className="text-foreground">Descrição:</strong> {plan.descricao_curta_imagem}</p>
          <p className="text-sm"><strong className="text-foreground">Hashtags:</strong> {plan.hashtags.join(' ')}</p>
          <Button onClick={handleGenerateClick} className="w-full mt-4 gradient-primary">
            <Sparkles className="w-4 h-4 mr-2" /> Gerar com Modelo Sugerido
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText size={16} /> Plano de Conteúdo para 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {plan.plano_7_dias.map(item => (
              <AccordionItem value={`dia-${item.dia}`} key={item.dia}>
                <AccordionTrigger>Dia {item.dia}: {item.tema}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Copy Principal</Label>
                    <div className="relative">
                      <p className="text-sm p-2 bg-muted/30 rounded pr-8">{item.copy}</p>
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => copyToClipboard(item.copy)}><Copy size={12} /></Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Variações</Label>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {item.variacoes_copy.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatCriativo;