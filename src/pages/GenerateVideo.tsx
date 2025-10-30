import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Video, Sparkles, Upload, Download, Maximize2, Edit, Loader2, X, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storeMediaInSupabase, getMockUser } from "@/lib/supabase-storage";

interface GeneratedVideo {
  url: string;
  id: string;
  thumbnail?: string;
}

const GenerateVideo = () => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [modelo, setModelo] = useState("VideoFX Pro");
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [generationMode, setGenerationMode] = useState<"image" | "text">("image");


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie uma imagem .jpg, .png ou .webp",
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
    if (generationMode === "image" && !uploadedImage) {
      toast({
        title: "Imagem necessária",
        description: "Por favor, faça upload de uma imagem",
        variant: "destructive",
      });
      return;
    }

    if (generationMode === "text" && !description) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, adicione uma descrição",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedVideos([]);

    try {
      let imageUrl = '';

      // Se modo imagem, fazer upload primeiro
      if (generationMode === "image" && uploadedImage) {
        toast({
          title: "Enviando imagem...",
          description: "Fazendo upload da sua imagem",
        });

        imageUrl = await uploadToImgbb(uploadedImage);
      }

      toast({
        title: "Gerando vídeos...",
        description: `Processando ${quantity} vídeo(s). Isso pode levar até 10 minutos.`,
      });

      // Enviar para webhook com identificação de tipo
      const response = await fetch('https://n8n.conversio.ao/webhook-test/criar-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: generationMode, // 'image' ou 'text'
          image_url: generationMode === "image" ? imageUrl : null,
          description: description,
          quantidade: quantity.toString(),
          proporcao: aspectRatio,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar requisição para geração de vídeo');
      }

      const webhookResponse = await response.json();

      let videos: GeneratedVideo[] = [];

      if (webhookResponse && Array.isArray(webhookResponse)) {
        const temporaryUrls = webhookResponse
          .filter((item: any) => item?.message?.content)
          .map((item: any) => item.message.content);

        if (temporaryUrls.length > 0) {
          toast({
            title: "Salvando vídeos...",
            description: "Armazenando seus vídeos no servidor",
          });

          // Store in external Supabase and get permanent URLs
          const permanentUrls = await storeMediaInSupabase(temporaryUrls, 'video');

          videos = permanentUrls.map((url: string, index: number) => ({
            url: url,
            id: `${Date.now()}-${index}`,
            thumbnail: `https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop`
          }));
        }
      }

      if (videos.length > 0) {
        setGeneratedVideos(prev => [...videos, ...prev]);
        setHistory(prev => [...videos, ...prev]);

        toast({
          title: "Sucesso!",
          description: `${videos.length} vídeo(s) gerado(s) e armazenado(s) com sucesso`,
        });
      } else {
        throw new Error('Nenhum vídeo foi gerado');
      }
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-gerado-${index + 1}.mp4`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">3 créditos por geração</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,420px] gap-6">
          {/* Preview Area */}
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 min-h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                Resultado da Geração
              </h2>
              
              {isLoading ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {Array.from({ length: quantity }).map((_, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm">
                      <div className="aspect-video relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Gerando {i + 1}/{quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : generatedVideos.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {generatedVideos.map((video, index) => (
                    <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="relative aspect-video overflow-hidden bg-black">
                          <video 
                            src={video.url} 
                            className="w-full h-full object-cover"
                            controls
                            poster={video.thumbnail}
                          />
                        </div>
                        <div className="p-3 flex gap-2 bg-card/80 backdrop-blur-sm">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Ampliar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto bg-black">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <video 
                                  src={video.url} 
                                  className="max-w-full max-h-[85vh]"
                                  controls
                                  autoPlay
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(video.url, index)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center flex-1">
                  <div className="w-20 h-20 rounded-lg bg-muted/50 backdrop-blur-sm flex items-center justify-center">
                    <Video className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Pronto para criar?</h3>
                    <p className="text-muted-foreground max-w-md text-sm">
                      Configure as opções ao lado e clique em "Gerar Vídeo" para começar
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Histórico de Gerações
                </h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {history.map((video, index) => (
                      <Dialog key={video.id}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-all bg-black">
                            <div className="aspect-video relative">
                              {video.thumbnail && (
                                <img 
                                  src={video.thumbnail} 
                                  alt={`Histórico ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto bg-black">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <video 
                              src={video.url} 
                              className="max-w-full max-h-[85vh]"
                              controls
                              autoPlay
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Form Area */}
          <div className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-xl shadow-lg">
              <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as "image" | "text")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="image">Imagem para Vídeo</TabsTrigger>
                  <TabsTrigger value="text">Texto para Vídeo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="font-semibold">Imagem Base *</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 h-auto py-3 border-dashed" 
                        asChild
                        disabled={isLoading}
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {uploadedImage ? uploadedImage.name : 'Carregar imagem'}
                          </span>
                        </span>
                      </Button>
                    </label>
                    {uploadedImageUrl && (
                      <div className="relative mt-2 rounded-lg overflow-hidden">
                        <img 
                          src={uploadedImageUrl} 
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={removeUploadedImage}
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>📎</span> Formatos: .jpg, .png, .webp
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Descrição (Opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva como a imagem deve se movimentar... Ex: zoom suave, rotação 360°, efeito parallax..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-description" className="font-semibold">Descrição *</Label>
                    <Textarea
                      id="text-description"
                      placeholder="Descreva o vídeo que deseja gerar... Ex: produto em movimento, transição suave, fundo dinâmico..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Descreva detalhadamente o vídeo que deseja criar
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="model" className="font-semibold">Modelo de IA</Label>
                  <Select value={modelo} onValueChange={setModelo} disabled={isLoading}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VideoFX Pro">VideoFX Pro</SelectItem>
                      <SelectItem value="Motion Master">Motion Master</SelectItem>
                      <SelectItem value="Cinematic AI">Cinematic AI</SelectItem>
                      <SelectItem value="QuickCut AI">QuickCut AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="font-semibold">Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                      disabled={isLoading}
                      className="text-center"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Proporção</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="9:16">9:16</SelectItem>
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="4:5">4:5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            <Button 
              className="w-full h-12 font-semibold" 
              size="lg"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Vídeo
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateVideo;