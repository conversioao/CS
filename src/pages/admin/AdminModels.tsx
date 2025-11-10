import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Wand2, Video, Music, Combine, Loader2, AudioLines, PlusCircle, Edit, Upload, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface ModelOrTool {
  id?: string;
  name: string;
  description: string;
  category: string;
  credit_cost: number;
  is_active: boolean;
  image_url: string;
}

const toolIcons: { [key: string]: React.ElementType } = {
  generate_image: Sparkles, edit_image: Wand2, combine_image: Combine,
  generate_video: Video, generate_music: Music, generate_voice: AudioLines,
};

const AdminModels = () => {
  const [modelsAndTools, setModelsAndTools] = useState<ModelOrTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelOrTool | null>(null);
  const [formData, setFormData] = useState<ModelOrTool>({ 
    name: '', 
    description: '', 
    category: 'model', 
    credit_cost: 0, 
    is_active: true,
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchModelsAndTools = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('models_and_tools').select('*').order('category').order('name');
    if (error) toast.error("Erro ao carregar modelos e ferramentas.");
    else setModelsAndTools(data);
    setLoading(false);
  };

  useEffect(() => { fetchModelsAndTools(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'credit_cost' ? parseInt(value, 10) : value 
    }));
  };

  const handleSwitchChange = (checked: boolean) => { 
    setFormData(prev => ({ ...prev, is_active: checked })); 
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (item: ModelOrTool | null = null) => {
    if (item) { 
      setEditingItem(item); 
      setFormData(item); 
      setImagePreview(item.image_url);
    } 
    else { 
      setEditingItem(null); 
      setFormData({ 
        name: '', 
        description: '', 
        category: 'model', 
        credit_cost: 0, 
        is_active: true,
        image_url: ''
      }); 
      setImagePreview(null);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('model-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('model-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const dataToSubmit = { ...formData, image_url: imageUrl };
      
      const { error } = editingItem
        ? await supabase.from('models_and_tools').update(dataToSubmit).eq('id', editingItem.id!)
        : await supabase.from('models_and_tools').insert(dataToSubmit);

      if (error) throw error;
      
      toast.success(`Item ${editingItem ? 'atualizado' : 'criado'} com sucesso!`);
      setIsDialogOpen(false);
      fetchModelsAndTools();
    } catch (error) {
      toast.error("Erro ao salvar item.");
    }
  };

  const groupedItems = modelsAndTools.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ModelOrTool[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modelos e Ferramentas</h1>
          <p className="text-muted-foreground">Gestão centralizada dos modelos de IA e suas configurações.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="w-4 h-4 mr-2" />Novo Item
        </Button>
      </div>
      
      <Tabs defaultValue="models">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Modelos de IA</CardTitle>
              <CardDescription>Gerencie os modelos disponíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedItems['model']?.map(item => (
                    <Card key={item.id} className="bg-background/50">
                      <div className="relative aspect-video rounded-t-lg overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {item.name}
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="text-sm text-muted-foreground">Custo: <span className="font-mono">{item.credit_cost} créditos</span></p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="w-4 h-4 mr-2" />Editar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Ferramentas</CardTitle>
              <CardDescription>Gerencie as ferramentas disponíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedItems['tool']?.map(item => (
                    <Card key={item.id} className="bg-background/50">
                      <div className="relative aspect-video rounded-t-lg overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {item.name}
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="text-sm text-muted-foreground">Custo: <span className="font-mono">{item.credit_cost} créditos</span></p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="w-4 h-4 mr-2" />Editar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Criar Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="model">Modelo</option>
                  <option value="tool">Ferramenta</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credit_cost">Custo em Créditos</Label>
                <Input 
                  id="credit_cost" 
                  name="credit_cost" 
                  type="number" 
                  value={formData.credit_cost} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Imagem de Capa</Label>
              <Input 
                id="image" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
              <label htmlFor="image">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4" />
                    {imageFile ? imageFile.name : 'Selecionar imagem'}
                  </span>
                </Button>
              </label>
              
              {(imagePreview || formData.image_url) && (
                <div className="relative mt-2">
                  <img 
                    src={imagePreview || formData.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="is_active" 
                checked={formData.is_active} 
                onCheckedChange={handleSwitchChange} 
              />
              <Label htmlFor="is_active">Item Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModels;