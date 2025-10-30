import { Upload, Sparkles, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DemoSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Descubra o poder do Conversio Studio em segundos
          </h2>
          <p className="text-xl text-muted-foreground">
            Faça upload da imagem do seu produto e veja a IA gerar automaticamente um anúncio profissional.
          </p>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="explore">
              <ImageIcon className="w-4 h-4 mr-2" />
              Explorar
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-12 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">Arraste sua imagem ou clique para fazer upload</h3>
                  <p className="text-muted-foreground">PNG, JPG ou WEBP (máx. 10MB)</p>
                </div>
              </Card>
              
              <Card className="p-12 bg-secondary/50 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Seu anúncio gerado aparecerá aqui</h3>
                  <p className="text-muted-foreground">Processamento em menos de 5 segundos</p>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="generate">
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Gerando seu anúncio...</h3>
              <p className="text-muted-foreground mb-8">Nossa IA está criando algo incrível para você</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="explore">
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Explore os modelos disponíveis</h3>
              <p className="text-muted-foreground mb-8">Escolha o modelo perfeito para o seu produto</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card className="p-12 text-center">
              <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Galeria de criações</h3>
              <p className="text-muted-foreground mb-8">Veja o que outros usuários criaram</p>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-12">
          <Button size="lg" className="gradient-primary">
            Experimentar Agora Gratuitamente
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
