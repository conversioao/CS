import { Clock, Download } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RecentCreations = () => {
  const [recentImages, setRecentImages] = useState<Array<{ id: string; url: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<{ id: string; url: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Buscar imagens do localStorage
    const allImages: Array<{ id: string; url: string }> = [];
    
    // Buscar do histórico de geração de imagens
    const imageHistory = localStorage.getItem('image_history');
    if (imageHistory) {
      try {
        const parsed = JSON.parse(imageHistory);
        if (Array.isArray(parsed)) {
          allImages.push(...parsed);
        }
      } catch (e) {
        console.error('Error parsing image history:', e);
      }
    }
    
    // Pegar apenas as últimas 8 imagens
    setRecentImages(allImages.slice(0, 8));
  }, []);

  const handleImageClick = (creation: { id: string; url: string }) => {
    setSelectedImage(creation);
    setIsModalOpen(true);
  };

  const handleDownload = async () => {
    if (!selectedImage) return;
    
    try {
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversio-${selectedImage.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text">
          Criações Recentes
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Últimas 8 criações</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentImages.length > 0 ? (
          recentImages.map((creation) => (
            <div
              key={creation.id}
              onClick={() => handleImageClick(creation)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm"
            >
              <img
                src={creation.url}
                alt={`Criação`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-semibold text-sm">Sua criação</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhuma criação ainda. Comece a criar!</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sua Criação</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt="Criação em tamanho completo"
                className="w-full h-auto rounded-lg"
              />
              <Button 
                onClick={handleDownload} 
                className="w-full gradient-primary"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar Imagem
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RecentCreations;
