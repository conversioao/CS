import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = ["Tudo", "Imagens", "Vídeos"];

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [userMedia, setUserMedia] = useState<GalleryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Buscar mídia do localStorage
    const allMedia: GalleryItem[] = [];
    
    // Buscar imagens
    const imageHistory = localStorage.getItem('image_history');
    if (imageHistory) {
      try {
        const parsed = JSON.parse(imageHistory);
        if (Array.isArray(parsed)) {
          allMedia.push(...parsed.map((img: any) => ({ ...img, type: 'image' as const })));
        }
      } catch (e) {
        console.error('Error parsing image history:', e);
      }
    }
    
    // Buscar vídeos
    const videoHistory = localStorage.getItem('video_history');
    if (videoHistory) {
      try {
        const parsed = JSON.parse(videoHistory);
        if (Array.isArray(parsed)) {
          allMedia.push(...parsed.map((vid: any) => ({ ...vid, type: 'video' as const })));
        }
      } catch (e) {
        console.error('Error parsing video history:', e);
      }
    }
    
    setUserMedia(allMedia);
  }, []);

  const filteredMedia = userMedia.filter(item => {
    if (activeCategory === "Tudo") return true;
    if (activeCategory === "Imagens") return item.type === 'image';
    if (activeCategory === "Vídeos") return item.type === 'video';
    return true;
  });

  const handleDownload = async (url: string, type: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
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
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Galeria
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore criações incríveis da comunidade
            </p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMedia.length > 0 ? (
              filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-black">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt="Sua criação"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold mb-1">Suas Criações</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.type === 'image' ? 'Imagem gerada com IA' : 'Vídeo gerado com IA'}
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleDownload(item.url, item.type)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhuma criação encontrada. Comece a criar!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Gallery;