import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Download, Share2, ZoomIn, ZoomOut, RotateCw, Heart, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Loader2 } from "lucide-react";

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
  likes: number;
  is_liked: boolean;
}

const categories = ["Tudo", "Imagens", "Vídeos"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [userMedia, setUserMedia] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const zoomedImageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const { user } = useSession();

  useEffect(() => {
    const fetchUserMedia = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user media:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas criações",
          variant: "destructive",
        });
      } else {
        setUserMedia(data || []);
      }
      setLoading(false);
    };

    fetchUserMedia();
  }, [user, toast]);

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

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha criação no Conversio Studio',
          text: 'Confira minha criação feita com IA!',
          url: url,
        });
      } catch (error) {
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado",
          description: "O link foi copiado para a área de transferência",
        });
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o link",
          variant: "destructive",
        });
      }
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleLike = async (id: string) => {
    // This would be implemented with a proper like system
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O sistema de curtidas estará disponível em breve",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block"><DashboardSidebar /></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </main>
        </div>
      </div>
    );
  }

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
              Minha Galeria
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore suas criações incríveis
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

          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative">
                  <CardContent className="p-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="aspect-square overflow-hidden bg-black cursor-pointer">
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
                              controls={false}
                            />
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 flex flex-col">
                        <div className="flex-1 relative overflow-auto bg-black flex items-center justify-center">
                          <img
                            ref={zoomedImageRef}
                            src={item.url}
                            alt="Imagem ampliada"
                            className="max-w-none max-h-none"
                            style={{
                              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                              transition: 'transform 0.2s ease'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 bg-background">
                          <Button variant="outline" size="icon" onClick={handleZoomOut}>
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" onClick={handleReset}>
                            Reset
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleZoomIn}>
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleRotate}>
                            <RotateCw className="w-4 h-4" />
                          </Button>
                          <div className="flex-1"></div>
                          <Button variant="outline" size="icon" onClick={() => handleDownload(item.url, item.type)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleShare(item.url)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleLike(item.id)}
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-xs">{item.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">0</span>
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(item.url, item.type)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleShare(item.url)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma criação encontrada. Comece a criar!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gallery;