import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Video, Sparkles, Upload, Download, Loader2, X, SlidersHorizontal, Camera, Square, RectangleVertical, RectangleHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface GeneratedVideo {
  url: string;
  id: string;
}

const aspectRatios = [
  { value: "16:9", label: "16:9 (Horizontal)", icon: RectangleHorizontal },
  { value: "9:16", label: "9:16 (Vertical)", icon: RectangleVertical },
  { value: "1:1", label: "1:1 (Quadrado)", icon: Square },
  { value: "4:5", label: "4:5 (Retrato)", icon: RectangleVertical },
];

const GenerateVideo = () => {
  const [quantity, setQuantity] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [generationMode, setGenerationMode] = useState<"image" | "text">("image");
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageUpload = (file: File) => {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      toast.error("Formato inválido", { description: "Por favor, envie uma imagem .jpg, .png ou .webp." });
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImageUrl(reader.result as string);
    reader.readAsDataURL(file);
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
    if (generationMode === "image" && !uploadedImage) {
      toast.error("Imagem necessária", { description: "Por favor, faça upload de uma imagem." });
      return;
    }
    if (generationMode === "text" && !description) {
      toast.error("Descrição necessária", { description: "Por favor, adicione uma descrição." });
      return;
    }
    setIsLoading(true);
    setGeneratedVideos([]);
    try {
      let imageUrl = '';
      if (generationMode === "image" && uploadedImage) {
        toast.info("A fazer upload da imagem...");
        imageUrl = await uploadToImgbb(uploadedImage);
      }
      toast.info("A gerar vídeos...", { description: `Isso pode levar alguns minutos.` });
      const response = await fetch('https://n8n.conversio.ao/webhook-test/criar-video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: generationMode, image_url: imageUrl, description, quantidade: quantity.toString(), proporcao: aspectRatio }) });
      if (!response.ok) throw new Error('Erro ao gerar vídeo');
      const webhookResponse = await response.json();
      const temporaryUrls = (webhookResponse && Array.isArray(webhookResponse)) ? webhookResponse.filter(item => item?.message?.content).map(item => item.message.content) : [];
      if (temporaryUrls.length > 0) {
        toast.info("A salvar os seus vídeos...");
        const permanentUrls = await storeMediaInSupabase(temporaryUrls, 'video');
        const videos = permanentUrls.map((url, index) => ({ url, id: `${Date.now()}-${index}` }));
        setGeneratedVideos(videos);
        toast.success("Sucesso!", { description: `${videos.length} vídeo(s) gerado(s) com sucesso.` });
      } else {
        throw new Error('Nenhum vídeo foi gerado.');
      }
    } catch (error) {
      toast.error("Erro ao gerar vídeo", { description: "Ocorreu um problema. Por favor, tente novamente em breve." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `video-gerado-${index + 1}.mp4`;
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
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /><span>Voltar ao Dashboard</span></Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">3 créditos por vídeo</span></div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Video className="w-5 h-5 text-primary" /></div>Resultado da Geração</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  {Array.from({ length: quantity }).map((_, i) => (<div key={i} className="relative overflow-hidden rounded-lg bg-muted/30 aspect-video"><div className="absolute inset-0 flex flex-col items-center justify-center gap-2"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="text-xs">A gerar {i + 1}/{quantity}</p></div></div>))}
                </div>
              ) : generatedVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  {generatedVideos.map((video, index) => (
                    <Card key={video.id} className="overflow-hidden group"><CardContent className="p-0"><div className="relative aspect-video bg-black"><video src={video.url} className="w-full h-full object-cover" controls /><div className="absolute bottom-2 right-2 flex gap-1.5"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownload(video.url, index)}><Download className="w-4 h-4" /></Button></div></div></CardContent></Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"><Video className="w-10 h-10 text-muted-foreground" /></div><h3 className="text-xl font-bold">Pronto para criar?</h3><p className="text-muted-foreground max-w-md text-sm">Configure as opções abaixo para gerar o seu vídeo.</p></div>
              )}
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto mt-8 sticky bottom-6 z-20">
            <div className="relative flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg">
              {generationMode === 'image' && (<>
                <Input id="image-upload-video" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
                <label htmlFor="image-upload-video"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen(true)} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
                {uploadedImageUrl && (<div className="absolute -top-14 left-12 w-12 h-12 rounded-lg overflow-hidden border-2 border-primary"><img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setUploadedImageUrl(null)} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}
              </>)}
              <Textarea placeholder={generationMode === 'image' ? "Descreva o movimento..." : "Descreva o vídeo a ser criado..."} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none text-base py-2.5" rows={1} />
              <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="rounded-full" disabled={isLoading}><SlidersHorizontal className="w-6 h-6" /></Button></PopoverTrigger><PopoverContent className="w-80 mb-2"><div className="grid gap-4"><div className="space-y-2"><h4 className="font-medium">Configurações</h4><p className="text-sm text-muted-foreground">Ajuste os parâmetros do vídeo.</p></div><div className="grid gap-2"><div className="grid grid-cols-3 items-center gap-4"><Label>Modo</Label><div className="col-span-2"><Select value={generationMode} onValueChange={(v) => setGenerationMode(v as "image" | "text")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Imagem para Vídeo</SelectItem><SelectItem value="text">Texto para Vídeo</SelectItem></SelectContent></Select></div></div><div className="grid grid-cols-3 items-center gap-4"><Label>Quantidade</Label><Input type="number" min="1" max="4" value={quantity} onChange={(e) => setQuantity(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} className="col-span-2 h-8" /></div><div className="grid grid-cols-3 items-center gap-4"><Label>Proporção</Label><Select value={aspectRatio} onValueChange={setAspectRatio}><SelectTrigger className="col-span-2 h-8"><SelectValue /></SelectTrigger><SelectContent>{aspectRatios.map(ar => { const Icon = ar.icon; return (<SelectItem key={ar.value} value={ar.value}><div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{ar.label}</span></div></SelectItem>);})}</SelectContent></Select></div></div></div></PopoverContent></Popover>
              <Button size="icon" className="rounded-full w-10 h-10 gradient-primary" onClick={handleGenerate} disabled={isLoading}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
            </div>
          </div>
          <CameraCaptureDialog isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleImageUpload} />
        </main>
      </div>
    </div>
  );
};

export default GenerateVideo;