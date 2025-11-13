import { Download, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RecentCreations = () => {
  const [recentImages, setRecentImages] = useState<Array<{ id: string; url: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<{ id: string; url: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const allImages: Array<{ id: string; url: string }> = [];
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
    setRecentImages(allImages.slice(0, 4));
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
    <section id="recent-creations-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Criações Recentes</h2>
        <Link to="/gallery">
          <Button variant="ghost" className="group">
            Ver todas
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentImages.length > 0 ? (
          recentImages.map((creation) => (
            <div
              key={creation.id}
              onClick={() => handleImageClick(creation)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm shadow-lg border border-border/50 hover:border-primary/50"
            >
              <img
                src={creation.url}
                alt="Criação"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-semibold text-sm">Ver detalhes</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50">
            <p className="text-muted-foreground">Nenhuma criação ainda.</p>
            <Link to="/generate">
              <Button className="mt-4 gradient-primary">Comece a criar agora</Button>
            </Link>
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