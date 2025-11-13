import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Video, Sparkles, Upload, Download, Loader2, X, SlidersHorizontal, Camera, Square, RectangleVertical, RectangleHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const loadingMessages = [
  "A aquecer os processadores de vídeo...",
  "A renderizar os frames...",
  "A compilar o seu vídeo...",
  "Adicionando os toques finais...",
  "Quase pronto, isso pode demorar um pouco...",
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
  const [timer, setTimer] = useState(0);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setTimer(0);
      setCurrentLoadingMessage(loadingMessages[0]);
      let messageIndex = 0;
      interval = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer + 1;
          if (newTimer > 0 && newTimer % 15 === 0) {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setCurrentLoadingMessage(loadingMessages[messageIndex]);
          }
          return newTimer;
        });
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
        setGeneratedVideos(prev => [...videos, ...prev]);
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
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <motion.div 
              className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-red-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-orange-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>

          <div className="mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span>Voltar ao Dashboard</span></Link>
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">3 créditos por vídeo</span>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 flex-1 flex flex-col border border-border/50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Video className="w-5 h-5 text-primary" /></div>Resultado da Geração</h2>
              {generatedVideos.length === 0 && !isLoading ? (
                <motion.div 
                  className="flex-1 flex flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Video className="w-10 h-10 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Pronto para criar?</h3>
                  <p className="text-muted-foreground max-w-md text-sm">Configure as opções abaixo para gerar o seu vídeo.</p>
                </motion.div>
              ) : (
                <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {isLoading && (
                        Array.from({ length: quantity }).map((_, i) => (
                          <motion.div
                            key={`loader-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-lg bg-muted/30 aspect-video"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                <Video className="w-10 h-10 text-primary" />
                              </motion.div>
                              <p className="text-sm font-semibold">{currentLoadingMessage}</p>
                              <p className="text-xs text-muted-foreground">Vídeo {i + 1} de {quantity}</p>
                              <div className="text-lg font-mono text-primary tabular-nums">
                                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                      {generatedVideos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden group hover:shadow-xl hover:shadow-primary/20 transition-all">
                            <CardContent className="p-0">
                              <div className="relative aspect-video bg-black">
                                <video src={video.url} className="w-full h-full object-cover" controls />
                                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="outline" size="icon" className="h-8 w-8 bg-card/80 backdrop-blur-sm" onClick={() => handleDownload(video.url, index)}><Download className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-8 sticky bottom-0 pb-6 bg-background">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg"
            >
              {generationMode === 'image' && (<>
                <Input id="image-upload-video" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
                <label htmlFor="image-upload-video"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen(true)} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
                {uploadedImageUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-14 left-12 w-12 h-12 rounded-lg overflow-hidden border-2 border-primary shadow-lg"
                  >
                    <img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setUploadedImageUrl(null)} disabled={isLoading}><X className="w-3 h-3" /></Button>
                  </motion.div>
                )}
              </>)}
              <Textarea placeholder={generationMode === 'image' ? "Descreva o movimento..." : "Descreva o vídeo a ser criado..."} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none text-base py-2.5" rows={1} />
              <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="rounded-full" disabled={isLoading}><SlidersHorizontal className="w-6 h-6" /></Button></PopoverTrigger><PopoverContent className="w-80 mb-2"><div className="grid gap-4"><div className="space-y-2"><h4 className="font-medium">Configurações</h4><p className="text-sm text-muted-foreground">Ajuste os parâmetros do vídeo.</p></div><div className="grid gap-2"><div className="grid grid-cols-3 items-center gap-4"><Label>Modo</Label><div className="col-span-2"><Select value={generationMode} onValueChange={(v) => setGenerationMode(v as "image" | "text")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Imagem para Vídeo</SelectItem><SelectItem value="text">Texto para Vídeo</SelectItem></SelectContent></Select></div></div><div className="grid grid-cols-3 items-center gap-4"><Label>Quantidade</Label><Input type="number" min="1" max="4" value={quantity} onChange={(e) => setQuantity(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} className="col-span-2 h-8" /></div><div className="grid grid-cols-3 items-center gap-4"><Label>Proporção</Label><Select value={aspectRatio} onValueChange={setAspectRatio}><SelectTrigger className="col-span-2 h-8"><SelectValue /></SelectTrigger><SelectContent>{aspectRatios.map(ar => { const Icon = ar.icon; return (<SelectItem key={ar.value} value={ar.value}><div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{ar.label}</span></div></SelectItem>);})}</SelectContent></Select></div></div></div></PopoverContent></Popover>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="icon" className="rounded-full w-10 h-10 gradient-primary" onClick={handleGenerate} disabled={isLoading}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
              </motion.div>
            </motion.div>
          </div>
          <CameraCaptureDialog isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleImageUpload} />
        </main>
      </div>
    </div>
  );
};

export default GenerateVideo;