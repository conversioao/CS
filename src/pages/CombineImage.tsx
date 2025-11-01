import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Combine, Sparkles, Upload, Download, Maximize2, Loader2, X, Camera, ZoomIn, ZoomOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";

interface CombinedImage {
  url: string;
  id: string;
}

const CombineImage = () => {
  const [description, setDescription] = useState("");
  const [image1, setImage1] = useState<{ file: File | null, url: string | null }>({ file: null, url: null });
  const [image2, setImage2] = useState<{ file: File | null, url: string | null }>({ file: null, url: null });
  const [isLoading, setIsLoading] = useState(false);
  const [combinedImages, setCombinedImages] = useState<CombinedImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState<{ open: boolean, target: 1 | 2 }>({ open: false, target: 1 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleImageUpload = (file: File, target: 1 | 2) => {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      toast.error("Formato inválido", { description: "Por favor, envie uma imagem .jpg, .jpeg ou .png." });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 1) setImage1({ file, url: reader.result as string });
      else setImage2({ file, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('https://api.imgbb.com/1/upload?key=8360d0dc6e3b2243b4dc8a45b4040974', { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Erro no upload da imagem: ${file.name}`);
    const data = await response.json();
    return data.data.url;
  };

  const handleCombine = async () => {
    if (!image1.file || !image2.file || !description) {
      toast.error("Campos necessários", { description: "Por favor, envie duas imagens e uma descrição." });
      return;
    }
    setIsLoading(true);
    setCombinedImages([]);
    try {
      toast.info("A fazer upload das imagens...");
      const [url1, url2] = await Promise.all([uploadToImgbb(image1.file), uploadToImgbb(image2.file)]);
      
      toast.info("A combinar as suas imagens...");
      const response = await fetch('https://n8n.conversio.ao/webhook-test/editar_imagem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url_1: url1, image_url_2: url2, description }) });
      if (!response.ok) throw new Error('Erro ao combinar imagens');
      const data = await response.json();
      const temporaryUrl = data.url || data.image_url || url1;

      toast.info("A salvar a sua imagem...");
      const [permanentUrl] = await storeMediaInSupabase([temporaryUrl], 'image');
      const newImage: CombinedImage = { url: permanentUrl, id: `${Date.now()}` };
      setCombinedImages([newImage]);
      toast.success("Sucesso!", { description: "Imagens combinadas com sucesso." });
    } catch (error) {
      toast.error("Erro ao combinar imagens", { description: "Ocorreu um problema. Por favor, tente novamente em breve." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `imagem-combinada-${Date.now()}.png`;
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
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">2 créditos por combinação</span></div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Combine className="w-5 h-5 text-primary" /></div>Resultado da Combinação</h2>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center"><div className="relative overflow-hidden rounded-lg bg-muted/30 aspect-square w-full max-w-sm"><div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p>A combinar...</p></div></div></div>
              ) : combinedImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {combinedImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden group"><CardContent className="p-0"><div className="relative aspect-square"><img src={image.url} alt="Imagem combinada" className="w-full h-full object-cover" /><div className="absolute bottom-2 right-2 flex gap-1.5"><Dialog onOpenChange={(isOpen) => !isOpen && setZoomLevel(1)}><DialogTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button></DialogTrigger><DialogContent className="max-w-[95vw] max-h-[95vh] p-2 flex flex-col"><div className="flex-1 relative overflow-auto"><img src={image.url} alt="Imagem combinada" className="max-w-none max-h-none" style={{ transform: `scale(${zoomLevel})` }} /></div><div className="flex items-center justify-center gap-2 pt-2"><Button variant="outline" size="icon" onClick={() => setZoomLevel(p => Math.max(p - 0.2, 0.2))}><ZoomOut className="w-4 h-4" /></Button><Button variant="outline" onClick={() => setZoomLevel(1)}>Reset</Button><Button variant="outline" size="icon" onClick={() => setZoomLevel(p => Math.min(p + 0.2, 5))}><ZoomIn className="w-4 h-4" /></Button></div></DialogContent></Dialog><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownload(image.url)}><Download className="w-4 h-4" /></Button></div></div></CardContent></Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"><Combine className="w-10 h-10 text-muted-foreground" /></div><h3 className="text-xl font-bold">Pronto para combinar?</h3><p className="text-muted-foreground max-w-md text-sm">Envie duas imagens e descreva como combiná-las.</p></div>
              )}
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto mt-8 sticky bottom-6 z-20">
            <div className="relative flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 p-2 shadow-lg">
              <Input id="image-upload-1" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 1)} className="hidden" />
              <label htmlFor="image-upload-1"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
              <Input id="image-upload-2" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 2)} className="hidden" />
              <label htmlFor="image-upload-2"><Button variant="ghost" size="icon" className="rounded-full" asChild disabled={isLoading}><span><Upload className="w-5 h-5" /></span></Button></label>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCameraOpen({ open: true, target: 1 })} disabled={isLoading}><Camera className="w-5 h-5" /></Button>
              <div className="absolute -top-14 left-12 flex gap-2">
                {image1.url && (<div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary"><img src={image1.url} alt="Preview 1" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setImage1({ file: null, url: null })} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}
                {image2.url && (<div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary"><img src={image2.url} alt="Preview 2" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setImage2({ file: null, url: null })} disabled={isLoading}><X className="w-3 h-3" /></Button></div>)}
              </div>
              <Textarea placeholder="Descreva como combinar as imagens..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none text-base py-2.5" rows={1} />
              <Button size="icon" className="rounded-full w-10 h-10 gradient-primary" onClick={handleCombine} disabled={isLoading || !image1.file || !image2.file || !description}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</Button>
            </div>
          </div>
          <CameraCaptureDialog isOpen={isCameraOpen.open} onClose={() => setIsCameraOpen({ open: false, target: 1 })} onCapture={(file) => handleImageUpload(file, isCameraOpen.target)} />
        </main>
      </div>
    </div>
  );
};

export default CombineImage;