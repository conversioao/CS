import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Wand2, Sparkles, Upload, Download, Maximize2, Loader2, X, Camera, ZoomIn, ZoomOut, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";

interface EditedImage {
  url: string;
  id: string;
}

const EditImage = () => {
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageToEdit, setImageToEdit] = useState<EditedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { user, profile, refetchProfile } = useSession();

  const handleImageUpload = (file: File) => {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      toast.error("Formato inválido", { description: "Por favor, envie uma imagem .jpg, .jpeg ou .png." });
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !description) {
      toast.error("Campos necessários", { description: "Por favor, faça upload de uma imagem e adicione uma descrição." });
      return;
    }
    setIsLoading(true);
    try {
      toast.info("A fazer upload da imagem...");
      const formData = new FormData();
      formData.append('image', uploadedImage);
      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { method: 'POST', body: formData });
      if (!imgbbResponse.ok) throw new Error('Erro ao fazer upload da imagem');
      const imgbbData = await imgbbResponse.json();
      const imageUrl = imgbbData.data.url;

      toast.info("A editar a sua imagem...");
      const webhookResponse = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: imageUrl, description }) });
      if (!webhookResponse.ok) throw new Error('Erro ao processar edição');
      const webhookData = await webhookResponse.json();
      const temporaryUrl = webhookData.url || webhookData[0]?.message?.content || imageUrl;

      toast.info("A salvar a sua imagem...");
      const [permanentUrl] = await storeMediaInSupabase([temporaryUrl], 'image');
      const newImage: EditedImage = { url: permanentUrl, id: `${Date.now()}` };
      setEditedImages(prev => [newImage, ...prev]);
      toast.success("Sucesso!", { description: "Imagem editada e armazenada com sucesso." });
      
      // Deduct 1 credit for editing
      if (user && profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: profile.credits - 1 })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating credits:', updateError);
          toast.error("Erro ao atualizar créditos.");
        } else {
          // Update the local profile state
          await refetchProfile();
        }
        
        // Record the transaction
        const { error: transactionError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'edit',
            amount: -1,
            description: 'Edição de imagem',
            related_data: {
              original_image_url: imageUrl
            }
          });
        
        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
        }
      }
    } catch (error) {
      toast.error("Erro ao editar imagem", { description: "Ocorreu um problema. Por favor, tente novamente em breve." });
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
      const response = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageToEdit.url, description: editPrompt })
      });
      if (!response.ok) throw new Error('Erro ao editar imagem');
      
      const webhookData = await response.json();
      const temporaryUrl = webhookData.url || webhookData[0]?.message?.content || imageToEdit.url;

      toast.info("A salvar a sua imagem...");
      const [permanentUrl] = await storeMediaInSupabase([temporaryUrl], 'image');
      const newImage: EditedImage = { url: permanentUrl, id: `edited-${Date.now()}` };
      
      setEditedImages(prev => [newImage, ...prev]);
      toast.success("Sucesso!", { description: "Imagem editada com sucesso." });
      setImageToEdit(null);
      setEditPrompt('');
      
      // Deduct 1 credit for editing
      if (user && profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: profile.credits - 1 })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating credits:', updateError);
          toast.error("Erro ao atualizar créditos.");
        } else {
          // Update the local profile state
          await refetchProfile();
        }
        
        // Record the transaction
        const { error: transactionError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'edit',
            amount: -1,
            description: 'Edição de imagem',
            related_data: {
              original_image_id: imageToEdit.id
            }
          });
        
        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
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
    link.download = `imagem-editada-${Date.now()}.png`;
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
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"><Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">1 crédito por edição</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Wand2 className="w-5 h-5 text-primary" /></div>Resultado da Edição</h2>
              {editedImages.length === 0 && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"><Wand2 className="w-10 h-10 text-muted-foreground" /></div>
                  <h3 className="text-xl font-bold">Pronto para editar?</h3>
                  <p className="text-muted-foreground max-w-md text-sm">Faça upload de uma imagem e descreva as alterações.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading && (
                      <div className="relative overflow-hidden rounded-lg bg-muted/30 aspect-square">
                        <img src={isEditing ? imageToEdit?.url : uploadedImageUrl || ''} alt="A editar" className="w-full h-full object-cover filter blur-sm brightness-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p>A editar...</p>
                        </div>
                      </div>
                    )}
                    {editedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden group">
                        <CardContent className="p-0">
                          <div className="relative aspect-square">
                            <img src={image.url} alt="Imagem editada" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 flex gap-1.5">
                              <Dialog onOpenChange={(isOpen) => !isOpen && setZoomLevel(1)}>
                                <DialogTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 flex flex-col">
                                  <div className="flex-1 relative overflow-auto">
                                    <img src={image.url} alt="Imagem editada" className="max-w-none max-h-none" style={{ transform: `scale(${zoomLevel})` }} />
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
                <Input id="image-upload-edit" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
                <label htmlFor="image-upload-edit"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen(true)} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
                {uploadedImageUrl && (<div className="absolute -top-14 left-12 w-12 h-12 rounded-lg overflow-hidden border-2 border-primary"><img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setUploadedImageUrl(null)} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}
                <Textarea placeholder="Descreva as alterações... Ex: remover fundo, mudar cor..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none text-base py-2.5" rows={1} />
                <Button size="icon" className="rounded-full w-10 h-10 gradient-primary" onClick={handleGenerate} disabled={isLoading || !uploadedImage || !description}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
              </div>
            )}
          </div>
          <CameraCaptureDialog isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleImageUpload} />
        </main>
      </div>
    </div>
  );
};

export default EditImage;