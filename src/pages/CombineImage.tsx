import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Combine, Sparkles, Upload, Download, Maximize2, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storeMediaInSupabase } from "@/lib/supabase-storage";

interface CombinedImage {
  url: string;
  id: string;
}

const CombineImage = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [uploadedImage1, setUploadedImage1] = useState<File | null>(null);
  const [uploadedImage1Url, setUploadedImage1Url] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<File | null>(null);
  const [uploadedImage2Url, setUploadedImage2Url] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [combinedImages, setCombinedImages] = useState<CombinedImage[]>([]);
  const [history, setHistory] = useState<CombinedImage[]>([]);

  const handleImage1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadedImage1(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage1Url(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImage2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadedImage2(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage2Url(reader.result as string);
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

  const handleCombine = async () => {
    if (!uploadedImage1 || !uploadedImage2 || !description) {
      toast({
        title: "Campos necessários",
        description: "Por favor, faça upload de duas imagens e adicione uma descrição",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      toast({
        title: "Enviando imagens...",
        description: "Fazendo upload das imagens",
      });

      // Upload both images to ImgBB
      const url1 = await uploadToImgbb(uploadedImage1);
      const url2 = await uploadToImgbb(uploadedImage2);

      toast({
        title: "Combinando imagens...",
        description: "Processando suas imagens",
      });

      // Send to webhook
      const response = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url_1: url1,
          image_url_2: url2,
          description: description,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao combinar imagens');
      }

      const data = await response.json();
      
      // Process webhook response
      const temporaryUrl = data.url || data.image_url || url1; // Fallback to first image if no result

      // Automatically store in Supabase
      toast({
        title: "Salvando imagem...",
        description: "Armazenando no Supabase",
      });

      const [permanentUrl] = await storeMediaInSupabase([temporaryUrl], 'image');

      const combinedImage: CombinedImage = {
        url: permanentUrl,
        id: `${Date.now()}`,
      };

      setCombinedImages(prev => [combinedImage, ...prev]);
      setHistory(prev => [combinedImage, ...prev]);

      toast({
        title: "Sucesso!",
        description: "Imagens combinadas e armazenadas com sucesso no Supabase",
      });
    } catch (error) {
      console.error('Erro ao combinar imagens:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao combinar imagens. Tente novamente.",
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
      link.download = `imagem-combinada-${index + 1}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: "A imagem está sendo baixada",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem",
        variant: "destructive",
      });
    }
  };

  const removeUploadedImage1 = () => {
    setUploadedImage1(null);
    setUploadedImage1Url(null);
  };

  const removeUploadedImage2 = () => {
    setUploadedImage2(null);
    setUploadedImage2Url(null);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm sm:text-base">Voltar ao Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">2 créditos por combinação</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,420px] gap-4 sm:gap-6">
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />
                
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                    <Combine className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-base sm:text-2xl">Resultado da Combinação</span>
                </h2>
                
                {isLoading ? (
                  <div className="w-full flex-1 relative z-10">
                    <div className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm">
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Combinando imagens...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : combinedImages.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative z-10">
                    {combinedImages.map((image, index) => (
                      <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={`Imagem combinada ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
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
                              <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto">
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img 
                                    src={image.url} 
                                    alt={`Imagem combinada ${index + 1}`}
                                    className="max-w-full max-h-[85vh] object-contain cursor-zoom-in hover:scale-150 transition-transform duration-300"
                                    onClick={(e) => {
                                      e.currentTarget.classList.toggle('scale-150');
                                      e.currentTarget.classList.toggle('cursor-zoom-in');
                                      e.currentTarget.classList.toggle('cursor-zoom-out');
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(image.url, index)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-center flex-1 relative z-10">
                    <div className="w-20 h-20 rounded-lg bg-muted/50 backdrop-blur-sm flex items-center justify-center">
                      <Combine className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Pronto para combinar?</h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        Faça upload de duas imagens e descreva como deseja combiná-las
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Histórico de Combinações
                  </h3>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {history.map((image, index) => (
                        <Dialog key={image.id}>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-all">
                              <img 
                                src={image.url} 
                                alt={`Histórico ${index + 1}`}
                                className="w-full aspect-square object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Maximize2 className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto">
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img 
                                src={image.url} 
                                alt={`Histórico ${index + 1}`}
                                className="max-w-full max-h-[85vh] object-contain cursor-zoom-in hover:scale-150 transition-transform duration-300"
                                onClick={(e) => {
                                  e.currentTarget.classList.toggle('scale-150');
                                  e.currentTarget.classList.toggle('cursor-zoom-in');
                                  e.currentTarget.classList.toggle('cursor-zoom-out');
                                }}
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

            <div className="space-y-4">
              <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-xl shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image1-upload" className="font-semibold">Primeira Imagem</Label>
                    <Input
                      id="image1-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImage1Upload}
                      className="hidden"
                    />
                    <label htmlFor="image1-upload">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 h-auto py-3 border-dashed" 
                        asChild
                        disabled={isLoading}
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {uploadedImage1 ? uploadedImage1.name : 'Carregar primeira imagem'}
                          </span>
                        </span>
                      </Button>
                    </label>
                    {uploadedImage1Url && (
                      <div className="relative mt-2 rounded-lg overflow-hidden">
                        <img 
                          src={uploadedImage1Url} 
                          alt="Preview 1" 
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={removeUploadedImage1}
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image2-upload" className="font-semibold">Segunda Imagem</Label>
                    <Input
                      id="image2-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImage2Upload}
                      className="hidden"
                    />
                    <label htmlFor="image2-upload">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 h-auto py-3 border-dashed" 
                        asChild
                        disabled={isLoading}
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {uploadedImage2 ? uploadedImage2.name : 'Carregar segunda imagem'}
                          </span>
                        </span>
                      </Button>
                    </label>
                    {uploadedImage2Url && (
                      <div className="relative mt-2 rounded-lg overflow-hidden">
                        <img 
                          src={uploadedImage2Url} 
                          alt="Preview 2" 
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={removeUploadedImage2}
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>📎</span> Formatos: .jpg, .jpeg, .png
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Como Combinar</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva como deseja combinar as imagens... Ex: misturar 50/50, colocar uma sobre a outra, criar colagem..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Button 
                className="w-full h-11 sm:h-12 font-semibold text-sm sm:text-base" 
                size="lg"
                onClick={handleCombine}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Combinando...
                  </>
                ) : (
                  <>
                    <Combine className="w-4 h-4 mr-2" />
                    Combinar Imagens
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CombineImage;