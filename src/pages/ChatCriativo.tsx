import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Upload, Loader2, ArrowRight, History, Copy, FileText, BrainCircuit, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ChatStep = "start" | "image" | "name" | "audience" | "platform" | "style" | "loading" | "result";
type ChatResult = {
  copy: string;
  description: string;
  model: string;
};
type HistoryItem = {
  id: number;
  productName: string;
  result: ChatResult;
  imageUrl: string;
};

const ChatCriativo = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<ChatStep>("start");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [adStyle, setAdStyle] = useState("");
  const [chatResult, setChatResult] = useState<ChatResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("chatCriativoHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file));
      setStep("name");
    }
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Erro ao fazer upload da imagem');
    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async () => {
    if (!productImage || !productName || !targetAudience || !socialMedia || !adStyle) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }
    setStep("loading");
    try {
      const imageUrl = await uploadToImgbb(productImage);
      const response = await fetch('https://n8n.conversio.ao/webhook-test/chatcriativo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagem_produto: imageUrl,
          nome_produto: productName,
          publico_alvo: targetAudience,
          rede_social: socialMedia,
          estilo_anuncio: adStyle,
        }),
      });
      if (!response.ok) throw new Error('Erro na comunicação com o servidor.');
      const result: ChatResult = await response.json();
      setChatResult(result);
      
      const newHistoryItem: HistoryItem = { id: Date.now(), productName, result, imageUrl };
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("chatCriativoHistory", JSON.stringify(updatedHistory));

      setStep("result");
    } catch (error) {
      toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
      setStep("style");
    }
  };

  const handleStartOver = () => {
    setStep("start");
    setProductImage(null);
    setProductImageUrl("");
    setProductName("");
    setTargetAudience("");
    setSocialMedia("");
    setAdStyle("");
    setChatResult(null);
  };

  const renderStep = () => {
    switch (step) {
      case "start":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vamos criar um anúncio incrível!</h2>
            <p className="text-muted-foreground mb-6">Vou te guiar com algumas perguntas para gerar o melhor resultado.</p>
            <Button onClick={() => setStep("image")}>Começar Agora <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        );
      case "image":
        return (
          <div>
            <Label htmlFor="image-upload" className="text-lg font-semibold mb-4 block text-center">Primeiro, carregue a imagem do seu produto.</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <label htmlFor="image-upload" className="w-full">
              <div className="border-2 border-dashed border-border hover:border-primary transition-colors rounded-lg p-12 text-center cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p>Clique ou arraste para carregar</p>
              </div>
            </label>
          </div>
        );
      case "name":
        return (
          <div>
            <Label htmlFor="product-name" className="text-lg font-semibold mb-2 block">Qual é o nome do produto?</Label>
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Tênis de Corrida Ultra" />
            <Button onClick={() => productName && setStep("audience")} className="mt-4">Próximo</Button>
          </div>
        );
      case "audience":
        return (
          <div>
            <Label htmlFor="target-audience" className="text-lg font-semibold mb-2 block">Para quem é este produto? (Público-alvo)</Label>
            <Textarea id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Ex: Jovens atletas, 18-25 anos, que buscam performance." />
            <Button onClick={() => targetAudience && setStep("platform")} className="mt-4">Próximo</Button>
          </div>
        );
      case "platform":
        return (
          <div>
            <Label className="text-lg font-semibold mb-2 block">Para qual rede social é o anúncio?</Label>
            <Select onValueChange={(value) => setSocialMedia(value)}>
              <SelectTrigger><SelectValue placeholder="Selecione uma plataforma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => socialMedia && setStep("style")} className="mt-4">Próximo</Button>
          </div>
        );
      case "style":
        return (
          <div>
            <Label className="text-lg font-semibold mb-2 block">Qual estilo de anúncio você prefere?</Label>
            <Select onValueChange={(value) => setAdStyle(value)}>
              <SelectTrigger><SelectValue placeholder="Selecione um estilo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Moderno e Minimalista">Moderno e Minimalista</SelectItem>
                <SelectItem value="Vibrante e Energético">Vibrante e Energético</SelectItem>
                <SelectItem value="Elegante e Sofisticado">Elegante e Sofisticado</SelectItem>
                <SelectItem value="Divertido e Descontraído">Divertido e Descontraído</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSubmit} className="mt-4">Gerar Criativo</Button>
          </div>
        );
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-lg">A IA está trabalhando... Gerando sua campanha!</p>
          </div>
        );
      case "result":
        if (!chatResult) return null;
        const copyToClipboard = (text: string) => {
          navigator.clipboard.writeText(text);
          toast({ title: "Copiado!", description: "O texto foi copiado para a área de transferência." });
        };
        return (
          <div>
            <div className="grid md:grid-cols-[150px,1fr] gap-6 mb-6">
              <img src={productImageUrl} alt={productName} className="rounded-lg object-cover w-full h-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Criativo para "{productName}"</h2>
                <p className="text-muted-foreground">Aqui estão as sugestões da IA para o seu anúncio.</p>
              </div>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><Copy className="w-4 h-4 text-primary" />Copy para {socialMedia}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(chatResult.copy)}><Copy className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{chatResult.copy}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Descrição para Geração</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(chatResult.description)}><Copy className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">{chatResult.description}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" />Modelo Sugerido</CardTitle></CardHeader>
                <CardContent><p className="font-semibold text-primary">{chatResult.model}</p></CardContent>
              </Card>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button size="lg" variant="outline" onClick={handleStartOver} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Começar de Novo
              </Button>
              <Link to={`/generate?model=${encodeURIComponent(chatResult.model)}&description=${encodeURIComponent(chatResult.description)}&imageUrl=${encodeURIComponent(productImageUrl)}`} className="w-full">
                <Button size="lg" className="w-full gradient-primary">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Imagem
                </Button>
              </Link>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-hidden">
          <div className="h-full grid lg:grid-cols-[300px,1fr]">
            <aside className="hidden lg:block bg-card/30 border-r border-border/20 p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5" /> Histórico</h2>
              <div className="space-y-2">
                {history.map(item => (
                  <div key={item.id} onClick={() => { setChatResult(item.result); setProductImageUrl(item.imageUrl); setStep("result"); }} className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <p className="font-semibold truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.result.model}</p>
                  </div>
                ))}
              </div>
            </aside>
            <div className="flex items-center justify-center p-8">
              <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-xl p-8 shadow-lg">
                {renderStep()}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatCriativo;