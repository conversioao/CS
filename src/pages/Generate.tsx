import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Image, Sparkles, Download, Maximize2, Edit, Loader2, X, SlidersHorizontal, Camera, Square, RectangleVertical, RectangleHorizontal, ZoomIn, ZoomOut } from "lucide-react";
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

const loadingMessages = [
  "Calibrando a IA...",
  "Pintando os pixels...",
  "Dando vida à sua ideia...",
  "Quase lá...",
  "Ajustando os detalhes finais...",
];

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
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setTimer(0);
      setCurrentLoadingMessage(loadingMessages[0]);
      let messageIndex = 0;
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
        if ((timer + 1) % 4 === 0) {
          messageIndex = (messageIndex + 1) % loadingMessages.length;
          setCurrentLoadingMessage(loadingMessages[messageIndex]);
        }
      }, 1000);
    } else if (!isLoading && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, timer]);

  useEffect(() => {
    const modelParam = searchParams.get('model');
    const descriptionParam = searchParams.get('description');
    const imageUrlParam = searchParams.get('imageUrl');

    if (modelParam) setModelo(modelParam);
    if (descriptionParam) setDescription(descriptionParam);
    if (imageUrlParam) setUploadedImageUrl(imageUrlParam);
  }, [searchParams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validFormats.includes(file.type)) {
        toast.error("Formato inválido", { description: "Por favor, envie uma imagem .jpg, .jpeg ou .png. Tente novamente." });
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    setIsCameraOpen(false);
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Erro ao fazer upload da imagem');
    const data = await response.json();
    return data.data.url;
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl && !description) {
      toast.error("Faltam dados", { description: "Por favor, envie uma imagem ou escreva uma descrição." });
      return;
    }
    setIsLoading(true);
    try {
      let imgUrl = uploadedImageUrl;
      if (uploadedImage) {
        toast.info("Enviando imagem...", { description: "A fazer upload da sua imagem." });
        imgUrl = await uploadToImgbb(uploadedImage);
        setUploadedImageUrl(imgUrl);
      }
      toast.info("Gerando imagens...", { description: `A processar ${quantity} imagem(ns).` });
      const payload = {
        modelo,
        quantidade: quantity.toString(),
        proporcao: aspectRatio,
        descricao: description || "",
        tipo: uploadedImageUrl ? "modelo" : "texto",
        image_url: uploadedImageUrl ? imgUrl : undefined,
        text_prompt: !uploadedImageUrl ? description : undefined,
      };
      const response = await fetch('https://n8n.conversio.ao/webhook-test/Gerar_Modelos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('A resposta do servidor não foi bem-sucedida.');
      const webhookResponse = await response.json();
      if (webhookResponse && Array.isArray(webhookResponse)) {
        const temporaryUrls = webhookResponse.filter(item => item?.message?.content).map(item => item.message.content);
        if (temporaryUrls.length > 0) {
          toast.info("Salvando imagens...", { description: "A armazenar as suas imagens no servidor." });
          const permanentUrls = await storeMediaInSupabase(temporaryUrls, 'image');
          const images: GeneratedImage[] = permanentUrls.map((url, index) => ({ url, id: `${Date.now()}-${index}` }));
          setGeneratedImages(prev => [...images, ...prev]);
          toast.success("Sucesso!", { description: `${images.length} imagem(ns) gerada(s) e armazenada(s) com sucesso.` });
        } else {
          throw new Error('Nenhuma imagem foi gerada.');
        }
      } else {
        throw new Error('O formato da resposta do servidor é inválido.');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error("Ocorreu um erro ao gerar a imagem.", { description: "Por favor, tente novamente dentro de instantes." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem-gerada-${index + 1}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download iniciado", { description: "A imagem está a ser baixada." });
    } catch (error) {
      toast.error("Erro no download", { description: "Não foi possível baixar a imagem. Tente novamente." });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
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

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative flex flex-col">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /><span className="font-medium text-sm sm:text-base">Voltar ao Dashboard</span></Link>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">2 créditos</span>
                {isLoading && (<div className="flex items-center gap-1 text-sm font-mono ml-2 text-primary"><Loader2 className="w-4 h-4 animate-spin" /><span>{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</span></div>)}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50">
                <Badge variant="outline" className="hidden sm:flex border-0 text-sm">{models.find(m => m.value === modelo)?.label}</Badge>
                <Badge variant="outline" className="hidden md:flex border-0 text-sm">x{quantity}</Badge>
                <Badge variant="outline" className="hidden md:flex items-center gap-1.5 border-0 text-sm">{React.createElement(aspectRatios.find(ar => ar.value === aspectRatio)?.icon || Square, { className: 'w-4 h-4' })}{aspectRatio}</Badge>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-4 sm:p-6 flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" /><div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />
              {generatedImages.length === 0 && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-lg bg-muted/50 backdrop-blur-sm flex items-center justify-center"><Image className="w-10 h-10 text-muted-foreground" /></div>
                  <div className="space-y-2 mt-4">
                    <h3 className="text-xl font-bold">Pronto para criar?</h3>
                    <p className="text-muted-foreground max-w-md text-sm">Envie uma imagem ou descreva o que você quer gerar na caixa abaixo.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && isEditing && imageToEdit && (
                      <div className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm aspect-square">
                        <img src={imageToEdit.url} alt="A editar" className="w-full h-full object-cover filter blur-sm brightness-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/20">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p className="text-sm text-white/80 font-semibold">A editar...</p>
                        </div>
                      </div>
                    )}
                    {isLoading && !isEditing && (
                      Array.from({ length: quantity }).map((_, i) => (
                        <div key={`loader-${i}`} className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm aspect-square">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-xs text-white/80 text-center px-2">{currentLoadingMessage}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {generatedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm aspect-square">
                        <CardContent className="p-0 h-full">
                          <div className="relative w-full h-full overflow-hidden">
                            <img src={image.url} alt="Imagem gerada" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-2 right-2 flex gap-1.5">
                                <Dialog onOpenChange={(isOpen) => { if (!isOpen) setZoomLevel(1); }}>
                                  <DialogTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8 bg-black/50 border-white/20 hover:bg-black/80 text-white"><Maximize2 className="w-4 h-4" /></Button></DialogTrigger>
                                  <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex flex-col">
                                    <div className="flex-1 relative overflow-auto rounded-lg">
                                      <div className="flex items-center justify-center h-full w-full">
                                        <img src={image.url} alt="Imagem gerada" className="max-w-none max-h-none object-contain transition-transform duration-200 ease-in-out" style={{ transform: `scale(${zoomLevel})` }} />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 pt-2">
                                      <Button variant="outline" size="icon" onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.2))}><ZoomOut className="w-4 h-4" /></Button>
                                      <Button variant="outline" onClick={() => setZoomLevel(1)}>Reset</Button>
                                      <Button variant="outline" size="icon" onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 5))}><ZoomIn className="w-4 h-4" /></Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-black/50 border-white/20 hover:bg-black/80 text-white" onClick={() => handleDownload(image.url, 0)}><Download className="w-4 h-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-black/50 border-white/20 hover:bg-black/80 text-white" onClick={() => setImageToEdit(image)}><Edit className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <CameraCaptureDialog isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
          </div>
          
          <div className="w-full max-w-4xl mx-auto pt-8 sticky bottom-0 pb-6 bg-background">
            {imageToEdit ? (
              <div className="relative rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg animate-fade-in">
                <div className="p-2 border-b border-border/50 mb-2"><div className="flex items-center gap-3"><img src={imageToEdit.url} alt="Editing thumbnail" className="w-12 h-12 rounded-md object-cover" /><div className="flex-1"><p className="text-sm font-semibold">Editando imagem</p><p className="text-xs text-muted-foreground">Descreva as alterações que deseja fazer.</p></div><Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => { setImageToEdit(null); setEditPrompt(''); }}><X className="w-4 h-4" /></Button></div></div>
                <div className="flex items-center gap-2 px-2"><Textarea id="edit-description" placeholder="Ex: Mude a cor do fundo para azul..." value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} disabled={isEditing} className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base py-2.5" rows={1} /><Button size="icon" className="rounded-full w-10 h-10 gradient-primary glow-effect" onClick={handleEditImage} disabled={isEditing || !editPrompt.trim()}>{isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button></div>
              </div>
            ) : (
              <div className="relative flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg">
                <div className="relative"><Input id="image-upload" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden" /><label htmlFor="image-upload"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Image className="w-5 h-5" /></span></Button></label>{uploadedImageUrl && (<div className="absolute -top-14 left-0 w-12 h-12 rounded-lg overflow-hidden border-2 border-primary shadow-md"><img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={removeUploadedImage} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}</div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen(true)} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
                <Textarea id="description" placeholder={uploadedImageUrl ? "Descreva o que quer alterar ou adicionar..." : "Descreva a imagem que deseja criar..."} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base py-2.5 mx-2" rows={1} />
                <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="rounded-full" disabled={isLoading}><SlidersHorizontal className="w-6 h-6" /></Button></PopoverTrigger><PopoverContent className="w-80 mb-2"><div className="grid gap-4"><div className="space-y-2"><h4 className="font-medium leading-none">Configurações</h4><p className="text-sm text-muted-foreground">Ajuste os parâmetros da geração.</p></div><div className="grid gap-2"><div className="grid grid-cols-3 items-center gap-4"><Label htmlFor="model">Modelo</Label><Select value={modelo} onValueChange={setModelo} disabled={isLoading}><SelectTrigger id="model" className="col-span-2 h-8"><SelectValue /></SelectTrigger><SelectContent>{models.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}</SelectContent></Select></div><div className="grid grid-cols-3 items-center gap-4"><Label htmlFor="quantity">Quantidade</Label><Input id="quantity" type="number" min="1" max="6" value={quantity} onChange={(e) => setQuantity(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))} disabled={isLoading} className="col-span-2 h-8" /></div><div className="grid grid-cols-3 items-center gap-4"><Label htmlFor="aspectRatio">Proporção</Label><Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}><SelectTrigger id="aspectRatio" className="col-span-2 h-8"><SelectValue /></SelectTrigger><SelectContent>{aspectRatios.map(ar => { const Icon = ar.icon; return (<SelectItem key={ar.value} value={ar.value}><div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{ar.label}</span></div></SelectItem>);})}</SelectContent></Select></div></div></div></PopoverContent></Popover>
                <Button size="icon" className="rounded-full w-10 h-10 gradient-primary glow-effect" onClick={handleGenerate} disabled={isLoading || (!uploadedImageUrl && !description)}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Generate;