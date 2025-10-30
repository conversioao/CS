import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Video, Sparkles, Upload, Download, Maximize2, Loader2, X, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedVideo {
  url: string;
  id: string;
}

const Templates = () => {
  const { toast } = useToast();
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [modelo, setModelo] = useState("Video Pro");
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validFormats.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie uma imagem .jpg, .jpeg ou .png",
          variant: "destructive",
        });
        return;
      }

      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({
        title: "Imagem necessária",
        description: "Por favor, faça o upload de uma imagem antes de gerar o vídeo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedVideos([]);

    try {
      toast({
        title: "Processando...",
        description: "Fazendo upload da imagem",
      });

      const imgbbUrl = await uploadToImgbb(uploadedImage);

      toast({
        title: "Gerando vídeo...",
        description: `Criando vídeo de ${duration} segundos`,
      });

      // Simulação - substituir pelo webhook real quando disponível
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockVideo: GeneratedVideo = {
        url: imgbbUrl, // Por enquanto usa a imagem, depois substituir pela URL do vídeo
        id: `${Date.now()}-0`,
      };

      setGeneratedVideos([mockVideo]);
      setHistory(prev => [mockVideo, ...prev]);

      toast({
        title: "Sucesso!",
        description: "Vídeo gerado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar vídeo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `video-gerado-${index + 1}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download iniciado",
        description: "O vídeo está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o vídeo",
        variant: "destructive",
      });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold">3 créditos por vídeo</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,420px] gap-6">
          {/* Preview Area */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-border/50 p-8 shadow-2xl backdrop-blur-sm min-h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                Resultado da Geração
              </h2>
              
              {isLoading ? (
                <div className="w-full flex-1">
                  <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 h-full">
                    <div className="aspect-video relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" 
                           style={{ backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)' }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium text-primary">Gerando vídeo mágico...</p>
                          <div className="flex gap-1 justify-center">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="w-2 h-2 rounded-full bg-primary animate-pulse" 
                                   style={{ animationDelay: `${j * 0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : generatedVideos.length > 0 ? (
                <div className="w-full flex-1">
                  {generatedVideos.map((video, index) => (
                    <Card key={video.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-primary/20 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-black">
                          {/* Placeholder - substituir por player de vídeo real */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-20 h-20 text-white/80 hover:text-white transition-colors cursor-pointer" />
                          </div>
                          <img 
                            src={video.url} 
                            alt={`Vídeo gerado ${index + 1}`}
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                        <div className="p-4 flex gap-2 bg-gradient-to-br from-card to-primary/5">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl p-0 overflow-hidden bg-black">
                              <video 
                                src={video.url} 
                                controls
                                className="w-full h-auto"
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(video.url, index)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-6 text-center flex-1">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Video className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Pronto para criar vídeos?</h3>
                    <p className="text-muted-foreground max-w-md">
                      Configure as opções ao lado e clique em "Gerar Vídeo" para criar conteúdo em movimento
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-gradient-to-br from-card via-card to-secondary/5 rounded-2xl border border-border/50 p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  Histórico de Vídeos
                </h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {history.map((video, index) => (
                      <Dialog key={video.id}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
                            <div className="aspect-video bg-black flex items-center justify-center">
                              <Play className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-black">
                          <video 
                            src={video.url} 
                            controls
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Form Area */}
          <div className="space-y-5">
            <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-xl">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="video-image-upload" className="text-base font-semibold">Imagem Base</Label>
                  <Input
                    id="video-image-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="video-image-upload">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-auto py-4 border-dashed border-2 hover:border-primary hover:bg-primary/5" 
                      asChild
                      disabled={isLoading}
                    >
                      <span>
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {uploadedImage ? uploadedImage.name : 'Carregar imagem para animar'}
                        </span>
                      </span>
                    </Button>
                  </label>
                  {uploadedImageUrl && (
                    <div className="relative mt-3 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                      <img 
                        src={uploadedImageUrl} 
                        alt="Preview" 
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 shadow-lg"
                        onClick={removeUploadedImage}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>📎</span> Formatos: .jpg, .jpeg, .png
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-description" className="text-base font-semibold">Descrição do Movimento</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Descreva como quer animar... Ex: zoom suave, rotação lenta, movimento de câmera cinematográfico..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    🎬 Seja específico sobre o movimento desejado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-model" className="text-base font-semibold">Modelo de IA</Label>
                  <Select value={modelo} onValueChange={setModelo} disabled={isLoading}>
                    <SelectTrigger id="video-model" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video Pro">🎥 Video Pro</SelectItem>
                      <SelectItem value="Motion AI">🌊 Motion AI</SelectItem>
                      <SelectItem value="Cinematic">🎬 Cinematic</SelectItem>
                      <SelectItem value="Fast Motion">⚡ Fast Motion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Duração (seg)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(Math.min(30, Math.max(3, parseInt(e.target.value) || 5)))}
                      disabled={isLoading}
                      className="h-12 text-center text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Proporção</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                        <SelectItem value="9:16">9:16 (Stories)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            <Button 
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              size="lg"
              onClick={handleGenerate}
              disabled={isLoading || !uploadedImage}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gerando vídeo...</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>Gerar Vídeo</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Templates;
