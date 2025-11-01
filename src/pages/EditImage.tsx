import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Wand2, Sparkles, Upload, Download, Maximize2, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storeMediaInSupabase } from "@/lib/supabase-storage";

interface EditedImage {
  url: string;
  id: string;
}

const EditImage = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [history, setHistory] = useState<EditedImage[]>([]);

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

  const handleEdit = async () => {
    if (!uploadedImage || !description) {
      toast({
        title: "Campos necessários",
        description: "Por favor, faça upload de uma imagem e adicione uma descrição",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      toast({
        title: "Editando imagem...",
        description: "Processando suas alterações",
      });

      // Upload da imagem para imgbb primeiro
      const formData = new FormData();
      formData.append('image', uploadedImage);

      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', {
        method: 'POST',
        body: formData,
      });

      if (!imgbbResponse.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const imgbbData = await imgbbResponse.json();
      const imageUrl = imgbbData.data.url;

      // Enviar para o webhook de edição
      const webhookResponse = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          description: description,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Erro ao processar edição');
      }

      const webhookData = await webhookResponse.json();
      const temporaryUrl = webhookData.url || webhookData[0]?.message?.content || imageUrl;

      // Automatically store in Supabase
      toast({
        title: "Salvando imagem...",
        description: "Armazenando no Supabase",
      });

      const [permanentUrl] = await storeMediaInSupabase([temporaryUrl], 'image');

      const mockImage: EditedImage = {
        url: permanentUrl,
        id: `${Date.now()}`,
      };

      setEditedImages(prev => [mockImage, ...prev]);
      setHistory(prev => [mockImage, ...prev]);

      toast({
        title: "Sucesso!",
        description: "Imagem editada e armazenada com sucesso no Supabase",
      });
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao editar imagem. Tente novamente.",
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
      link.download = `imagem-editada-${index + 1}.png`;
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

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
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
          
          <div className="mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Voltar ao Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">1 crédito por edição</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,420px] gap-6">
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />
                
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-primary" />
                  </div>
                  Resultado da Edição
                </h2>
                
                {isLoading ? (
                  <div className="w-full flex-1 relative z-10">
                    <div className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm">
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Editando imagem...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : editedImages.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative z-10">
                    {editedImages.map((image, index) => (
                      <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={`Imagem editada ${index + 1}`}
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
                                    alt={`Imagem editada ${index + 1}`}
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
                      <Wand2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Pronto para editar?</h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        Faça upload de uma imagem e descreva as alterações que deseja fazer
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Histórico de Edições
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
              <Card className="p-6 bg-card/50 backdrop-blur-xl shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="font-semibold">Imagem para Editar</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png"
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
                      <span>📎</span> Formatos: .jpg, .jpeg, .png
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Descrição das Alterações</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva as alterações que deseja fazer... Ex: remover fundo, mudar cor, adicionar filtro..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Button 
                className="w-full h-12 font-semibold" 
                size="lg"
                onClick={handleEdit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Editando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Editar Imagem
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

export default EditImage;