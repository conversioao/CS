import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Image, Sparkles, Download, Maximize2, Edit, Loader2, X, SlidersHorizontal, Camera, Square, RectangleVertical, RectangleHorizontal, ZoomIn, ZoomOut, Upload } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface GeneratedImage {
  url: string;
  id: string;
}

const models = [
  { value: "Conversio Studio — Persona", label: "Persona V.1.0" },
  { value: "Conversio Studio — Pulse", label: "Pulse V.1.0" },
  { value: "Conversio Studio — StyleAI", label: "StyleAI V.1.0" },
  { value: "Conversio Studio — Vision", label: "Vision V.1.0" },
];

const aspectRatios = [
  { value: "1:1", label: "1:1", icon: Square },
  { value: "9:16", label: "9:16 (Vertical)", icon: RectangleVertical },
  { value: "16:9", label: "16:9 (Horizontal)", icon: RectangleHorizontal },
  { value: "4:5", label: "4:5 (Retrato)", icon: RectangleVertical },
];

const Generate = () => {
  const [searchParams] = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [modelo, setModelo] = useState(models[0].value);
  
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [imageToEdit, setImageToEdit] = useState<GeneratedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const modelParam = searchParams.get('model');
    if (modelParam) setModelo(modelParam);
  }, [searchParams]);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl && !description) {
      toast.error("Faltam dados", { description: "Por favor, envie uma imagem ou escreva uma descrição." });
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = uploadedImageUrl || '';
      if (uploadedImage) {
        toast.info("A fazer upload da imagem...");
        const formData = new FormData();
        formData.append('image', uploadedImage);
        const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { method: 'POST', body: formData });
        if (!imgbbResponse.ok) throw new Error('Erro ao fazer upload da imagem');
        const imgbbData = await imgbbResponse.json();
        imageUrl = imgbbData.data.url;
      }
      
      toast.info("A gerar imagens...", { description: `Isso pode levar até ${quantity * 30} segundos.` });
      const response = await fetch('https://n8n.conversio.ao/webhook-test/criar-imagem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: imageUrl, description, quantidade: quantity.toString(), proporcao: aspectRatio, modelo }) });
      if (!response.ok) throw new Error('Erro ao gerar imagem');
      const webhookResponse = await response.json();
      if (webhookResponse && Array.isArray(webhookResponse)) {
        const urls = webhookResponse.filter(item => item?.message?.content).map(item => item.message.content);
        if (urls.length > 0) {
          const storedUrls = await storeMediaInSupabase(urls, 'image');
          const newImages: GeneratedImage[] = storedUrls.map((url, index) => ({ url, id: `${Date.now()}-${index}` }));
          setGeneratedImages(prev => [...newImages, ...prev]);
          toast.success("Sucesso!", { description: `${newImages.length} imagem(s) gerada(s) com sucesso.` });
        }
      }
    } catch (error) {
      toast.error("Erro ao gerar imagem", { description: "Ocorreu um problema. Por favor, tente novamente em breve." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim() || !imageToEdit) {
      toast.error("Faltam dados", { description: "Por favor, adicione uma descrição para editar a imagem." });
      return;
    }
    setIsEditing(true);
    setIsLoading(true);
    try {
      toast.info("Editando imagem...", { description: "A processar a sua solicitação." });
      const response = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: imageToEdit.url, description: editPrompt }) });
      if (!response.ok) throw new Error('Erro ao editar imagem');
      const webhookResponse = await response.json();
      if (webhookResponse && Array.isArray(webhookResponse)) {
        const editedUrls = webhookResponse.filter(item => item?.message?.content).map(item => item.message.content);
        if (editedUrls.length > 0) {
          const storedUrls = await storeMediaInSupabase(editedUrls, 'image');
          const newEditedImages: GeneratedImage[] = storedUrls.map((url, index) => ({ url, id: `edited-${Date.now()}-${index}` }));
          setGeneratedImages(prev => [...newEditedImages, ...prev]);
          toast.success("Sucesso!", { description: "Imagem editada com sucesso." });
          setImageToEdit(null);
          setEditPrompt('');
        }
      }
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      toast.error("Ocorreu um erro ao editar a imagem.", { description: "Por favor, tente novamente dentro de instantes." });
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `imagem-gerada-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado.");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative flex flex-col">
          <div className="absolute inset-0 pointer-events-none z-[-1] bg-dot-pattern opacity-20" />
          <div className="mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /><span>Voltar ao Dashboard</span></Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">1 crédito por imagem</span></div>
          </div>
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Image className="w-5 h-5 text-primary" /></div>Resultado da Geração</h2>
              {generatedImages.length === 0 && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"><Image className="w-10 h-10 text-muted-foreground" /></div>
                  <h3 className="text-xl font-bold">Pronto para criar?</h3>
                  <p className="text-muted-foreground max-w-md text-sm">Configure as opções abaixo para gerar a sua imagem.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading && !isEditing && (
                      Array.from({ length: quantity }).map((_, i) => (
                        <div key={`loader-${i}`} className="relative overflow-hidden rounded-lg bg-muted/30 aspect-square">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm font-semibold">A gerar imagem {i + 1}...</p>
                            <div className="text-lg font-mono text-primary tabular-nums">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && isEditing && (
                      <div className="relative overflow-hidden rounded-lg bg-muted/30 aspect-square">
                        <img src={imageToEdit?.url} alt="A editar" className="w-full h-full object-cover filter blur-sm brightness-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p>A editar...</p>
                        </div>
                      </div>
                    )}
                    {generatedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden group">
                        <CardContent className="p-0">
                          <div className="relative aspect-square">
                            <img src={image.url} alt="Imagem gerada" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 flex gap-1.5">
                              <Dialog onOpenChange={(isOpen) => !isOpen && setZoomLevel(1)}>
                                <DialogTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 flex flex-col">
                                  <div className="flex-1 relative overflow-auto">
                                    <img src={image.url} alt="Imagem gerada" className="max-w-none max-h-none" style={{ transform: `scale(${zoomLevel})` }} />
                                  </div>
                                  <div className="flex items-center justify-center gap-2 pt-2">
                                    <Button variant="outline" size="icon" onClick={() => setZoomLevel(p => Math.max(p - 0.2, 0.2))}><ZoomOut className="w-4 h-4" /></Button>
                                    <Button variant="outline" onClick={() => setZoomLevel(1)}>Reset</Button>
                                    <Button variant="outline" size="icon" onClick={() => setZoomLevel(p => Math.min(p + 0.2, 5))}><ZoomIn className="w-4 h-4" /></Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownload(image.url)}><Download className="w-4 h-4" /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setImageToEdit(image)}><Edit className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto pt-8 sticky bottom-0 pb-6 bg-background">
            {imageToEdit ? (
              <div className="relative rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg animate-fade-in">
                <div className="p-2 border-b border-border/50 mb-2">
                  <div className="flex items-center gap-3">
                    <img src={imageToEdit.url} alt="Editing thumbnail" className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Editando imagem</p>
                      <p className="text-xs text-muted-foreground">Descreva as alterações que deseja fazer.</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => { setImageToEdit(null); setEditPrompt(''); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <Textarea
                    id="edit-description"
                    placeholder="Ex: Mude a cor do fundo para azul..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    disabled={isEditing}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base py-2.5"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    className="rounded-full w-10 h-10 gradient-primary glow-effect"
                    onClick={handleEditImage}
                    disabled={isEditing || !editPrompt.trim()}
                  >
                    {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg">
                <Input id="image-upload" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
                <label htmlFor="image-upload"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen(true)} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
                {uploadedImageUrl && (<div className="absolute -top-14 left-12 w-12 h-12 rounded-lg overflow-hidden border-2 border-primary"><img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setUploadedImageUrl(null)} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}
                <Textarea id="description" placeholder={uploadedImageUrl ? "Descreva o que quer alterar ou adicionar..." : "Descreva a imagem que deseja criar..."} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base py-2.5 mx-2" rows={1} />
                <Popover>
                  <PopoverTrigger asChild><Button variant="ghost" size="icon" className="rounded-full" disabled={isLoading}><SlidersHorizontal className="w-6 h-6" /></Button></PopoverTrigger>
                  <PopoverContent className="w-80 mb-2">
                    <div className="grid gap-4">
                      <div className="space-y-2"><h4 className="font-medium leading-none">Configurações</h4><p className="text-sm text-muted-foreground">Ajuste os parâmetros da geração.</p></div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-3 items-center gap-4"><Label htmlFor="modelo">Modelo</Label><Select value={modelo} onValueChange={setModelo}><SelectTrigger id="modelo" className="col-span-2 h-8"><SelectValue /></SelectTrigger><SelectContent>{models.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}</SelectContent></Select></div>
                        <div className="grid grid-cols-3 items-center gap-4"><Label htmlFor="quantity">Quantidade</Label><Input id="quantity" type="number" min="1" max="4" value={quantity} onChange={(e) => setQuantity(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} className="col-span-2 h-8" /></div>
                        <div><Label className="text-sm font-medium">Proporção</Label><div className="flex items-center gap-2 mt-2">{aspectRatios.map(ar => { const Icon = ar.icon; return (<Button key={ar.value} variant={aspectRatio === ar.value ? "default" : "outline"} size="icon" onClick={() => setAspectRatio(ar.value)} className="h-12 w-12 flex-col gap-1"><Icon className="w-5 h-5" /><span className="text-xs">{ar.value}</span></Button>);})}</div></div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button size="icon" className="rounded-full w-10 h-10 gradient-primary glow-effect" onClick={handleGenerate} disabled={isLoading || (!uploadedImageUrl && !description)}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
              </div>
            )}
          </div>
          <CameraCaptureDialog isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleImageUpload} />
        </main>
      </div>
    </div>
  );
};

export default Generate;