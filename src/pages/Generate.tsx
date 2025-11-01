import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Image, Sparkles, Upload, Download, Maximize2, Edit, Loader2, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface GeneratedImage {
  url: string;
  id: string;
}

interface EditModalState {
  isOpen: boolean;
  imageUrl: string;
  imageId: string;
}

const Generate = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [modelo, setModelo] = useState("Advision UGC");
  
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<"image" | "text">("image");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, imageUrl: '', imageId: '' });
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const modelParam = searchParams.get('model');
    const descriptionParam = searchParams.get('description');
    const imageUrlParam = searchParams.get('imageUrl');

    if (modelParam) setModelo(modelParam);
    if (descriptionParam) setDescription(descriptionParam);
    if (imageUrlParam) {
      setUploadedImageUrl(imageUrlParam);
      setGenerationType("image");
    }
  }, [searchParams]);

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
    if (generationType === "image" && !uploadedImage && !uploadedImageUrl) {
      toast({ title: "Imagem necessária", description: "Por favor, faça o upload de uma imagem", variant: "destructive" });
      return;
    }
    if (generationType === "text" && !description) {
      toast({ title: "Descrição necessária", description: "Por favor, adicione uma descrição para gerar a imagem", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);

    try {
      let imgUrl = uploadedImageUrl;
      
      if (generationType === "image" && uploadedImage) {
        toast({ title: "Enviando imagem...", description: "Fazendo upload da sua imagem" });
        imgUrl = await uploadToImgbb(uploadedImage);
        setUploadedImageUrl(imgUrl);
      }

      toast({ title: "Gerando imagens...", description: `Processando ${quantity} imagem(ns)` });

      const payload: any = {
        modelo: modelo,
        quantidade: quantity.toString(),
        proporcao: aspectRatio,
        tipo: generationType === "text" ? "texto" : "modelo",
        descricao: description || "",
      };

      if (generationType === "text") {
        payload.text_prompt = description;
      } else {
        payload.image_url = imgUrl;
      }

      const response = await fetch('https://n8n.conversio.ao/webhook/Gerar_Modelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao gerar imagem');
      const webhookResponse = await response.json();

      if (webhookResponse && Array.isArray(webhookResponse)) {
        const temporaryUrls = webhookResponse.filter((item: any) => item?.message?.content).map((item: any) => item.message.content);
        if (temporaryUrls.length > 0) {
          toast({ title: "Salvando imagens...", description: "Armazenando suas imagens no servidor" });
          const permanentUrls = await storeMediaInSupabase(temporaryUrls, 'image');
          const images: GeneratedImage[] = permanentUrls.map((url: string, index: number) => ({ url, id: `${Date.now()}-${index}` }));
          setGeneratedImages(prev => [...images, ...prev]);
          setHistory(prev => [...images, ...prev]);
          toast({ title: "Sucesso!", description: `${images.length} imagem(ns) gerada(s) e armazenada(s) com sucesso` });
        } else {
          throw new Error('Nenhuma imagem foi gerada');
        }
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
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
      toast({ title: "Download iniciado", description: "A imagem está sendo baixada" });
    } catch (error) {
      toast({ title: "Erro no download", description: "Não foi possível baixar a imagem", variant: "destructive" });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      toast({ title: "Prompt necessário", description: "Por favor, adicione uma descrição para editar a imagem", variant: "destructive" });
      return;
    }
    setIsEditing(true);
    try {
      toast({ title: "Editando imagem...", description: "Processando sua solicitação" });
      const response = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: editModal.imageUrl, description: editPrompt }),
      });
      if (!response.ok) throw new Error('Erro ao editar imagem');
      const webhookResponse = await response.json();
      if (webhookResponse && Array.isArray(webhookResponse)) {
        const editedUrls = webhookResponse.filter((item: any) => item?.message?.content).map((item: any) => item.message.content);
        if (editedUrls.length > 0) {
          const storedUrls = await storeMediaInSupabase(editedUrls, 'image');
          const newEditedImages: GeneratedImage[] = storedUrls.map((url: string, index: number) => ({ url, id: `edited-${Date.now()}-${index}` }));
          setGeneratedImages(prev => [...newEditedImages, ...prev]);
          setHistory(prev => [...newEditedImages, ...prev]);
          toast({ title: "Sucesso!", description: "Imagem editada com sucesso" });
          setEditModal({ isOpen: false, imageUrl: '', imageId: '' });
          setEditPrompt('');
        }
      }
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
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
              <span className="text-xs sm:text-sm font-semibold">2 créditos por geração</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,420px] gap-4 sm:gap-6">
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />
                
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-base sm:text-2xl">Resultado da Geração</span>
                </h2>
                
                {isLoading ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative z-10">
                    {Array.from({ length: quantity }).map((_, i) => (
                      <div key={i} className="relative overflow-hidden rounded-lg bg-muted/30 backdrop-blur-sm">
                        <div className="aspect-square relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Gerando {i + 1}/{quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative z-10">
                    {generatedImages.map((image, index) => (
                      <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            <img src={image.url} alt={`Imagem gerada ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3 flex gap-2 bg-card/80 backdrop-blur-sm">
                            <Dialog>
                              <DialogTrigger asChild><Button variant="outline" size="sm" className="flex-1"><Maximize2 className="w-4 h-4 mr-2" />Ampliar</Button></DialogTrigger>
                              <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto">
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img src={image.url} alt={`Imagem gerada ${index + 1}`} className="max-w-full max-h-[85vh] object-contain" />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(image.url, index)}><Download className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setEditModal({ isOpen: true, imageUrl: image.url, imageId: image.id })}><Edit className="w-4 h-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-center flex-1 relative z-10">
                    <div className="w-20 h-20 rounded-lg bg-muted/50 backdrop-blur-sm flex items-center justify-center"><Image className="w-10 h-10 text-muted-foreground" /></div>
                    <div className="space-y-2"><h3 className="text-xl font-bold">Pronto para criar?</h3><p className="text-muted-foreground max-w-md text-sm">Configure as opções ao lado e clique em "Gerar Imagem" para começar</p></div>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Histórico de Gerações</h3>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {history.map((image, index) => (
                        <Dialog key={image.id}>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-all">
                              <img src={image.url} alt={`Histórico ${index + 1}`} className="w-full aspect-square object-cover" loading="lazy" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"><Maximize2 className="w-5 h-5 text-white" /></div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto">
                            <div className="relative w-full h-full flex items-center justify-center"><img src={image.url} alt={`Histórico ${index + 1}`} className="max-w-full max-h-[85vh] object-contain" /></div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <Dialog open={editModal.isOpen} onOpenChange={(open) => !isEditing && setEditModal({ isOpen: open, imageUrl: '', imageId: '' })}>
              <DialogContent className="max-w-2xl">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Editar Imagem</h2>
                  <div className="relative rounded-lg overflow-hidden bg-black"><img src={editModal.imageUrl} alt="Imagem para editar" className="w-full max-h-[400px] object-contain" /></div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prompt">Descreva como quer editar a imagem</Label>
                    <Textarea id="edit-prompt" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Ex: coloque essa imagem em uma mesa com uma família negra" className="min-h-[100px]" disabled={isEditing} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => { setEditModal({ isOpen: false, imageUrl: '', imageId: '' }); setEditPrompt(''); }} disabled={isEditing}>Cancelar</Button>
                    <Button onClick={handleEditImage} disabled={isEditing || !editPrompt.trim()}>
                      {isEditing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Editando...</>) : (<><Edit className="w-4 h-4 mr-2" />Editar Imagem</>)}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              <Card className="p-0 bg-card/50 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
                    <Button type="button" variant={generationType === "image" ? "default" : "ghost"} size="sm" onClick={() => setGenerationType("image")} disabled={isLoading} className="flex-1 transition-all"><Image className="w-4 h-4 mr-2" />Imagem</Button>
                    <Button type="button" variant={generationType === "text" ? "default" : "ghost"} size="sm" onClick={() => setGenerationType("text")} disabled={isLoading} className="flex-1 transition-all"><Sparkles className="w-4 h-4 mr-2" />Texto</Button>
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                  <AccordionItem value="item-1" className="border-t border-border/50">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold">{generationType === 'image' ? '1. Imagem Base' : '1. Descrição Principal'}</AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      {generationType === "image" ? (
                        <div className="space-y-2">
                          <Input id="image-upload" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden" />
                          <label htmlFor="image-upload">
                            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3 border-dashed" asChild disabled={isLoading}>
                              <span><Upload className="w-4 h-4" /><span className="text-sm">{uploadedImage ? uploadedImage.name : 'Carregar imagem do produto'}</span></span>
                            </Button>
                          </label>
                          {uploadedImageUrl && (
                            <div className="relative mt-2 rounded-lg overflow-hidden border">
                              <img src={uploadedImageUrl} alt="Preview" className="w-full h-32 object-cover" />
                              <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={removeUploadedImage} disabled={isLoading}><X className="w-3 h-3" /></Button>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><span>📎</span> Formatos: .jpg, .jpeg, .png</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="description" className="font-semibold">Descrição da Imagem *</Label>
                          <Textarea id="description" placeholder="Descreva a imagem que deseja criar em detalhes..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="min-h-[120px] resize-none" />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-t border-border/50">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold">2. Modelo e Estilo</AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6 space-y-4">
                      {generationType === 'image' && (
                        <div className="space-y-2">
                          <Label htmlFor="description-optional" className="font-semibold">Descrição (Opcional)</Label>
                          <Textarea id="description-optional" placeholder="Descreva o que você quer gerar..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="min-h-[80px] resize-none" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="model" className="font-semibold">Modelo de IA</Label>
                        <Select value={modelo} onValueChange={setModelo} disabled={isLoading}>
                          <SelectTrigger id="model"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Advision UGC">Advision UGC</SelectItem>
                            <SelectItem value="SocialBost">SocialBost</SelectItem>
                            <SelectItem value="FashionFit">FashionFit</SelectItem>
                            <SelectItem value="Adivisio VFX">Adivisio VFX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-t border-border/50">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold">3. Ajustes Finais</AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold">Quantidade</Label>
                          <Input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} disabled={isLoading} className="text-center" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">Proporção</Label>
                          <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1:1">1:1</SelectItem>
                              <SelectItem value="9:16">9:16</SelectItem>
                              <SelectItem value="16:9">16:9</SelectItem>
                              <SelectItem value="4:5">4:5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>

              <Button className="w-full h-11 sm:h-12 font-semibold text-sm sm:text-base gradient-primary glow-effect hover:scale-[1.02] transition-transform" size="lg" onClick={handleGenerate} disabled={isLoading || (generationType === "image" && !uploadedImageUrl) || (generationType === "text" && !description)}>
                {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Gerando...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Gerar Imagem</>)}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Generate;