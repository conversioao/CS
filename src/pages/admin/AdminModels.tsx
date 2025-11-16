import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Wand2, Video, Music, Combine, Loader2, AudioLines, PlusCircle, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ToolCost {
  id?: string;
  tool_identifier: string;
  display_name: string;
  credit_cost: number;
  is_active: boolean;
}

const toolIcons: { [key: string]: React.ElementType } = {
  generate_image: Sparkles, edit_image: Wand2, combine_image: Combine,
  generate_video: Video, generate_music: Music, generate_voice: AudioLines,
};

const AdminModels = () => {
  const [toolCosts, setToolCosts] = useState<ToolCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolCost | null>(null);
  const [formData, setFormData] = useState<ToolCost>({ tool_identifier: '', display_name: '', credit_cost: 0, is_active: true });

  const fetchToolCosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tool_costs').select('*');
    if (error) toast.error("Erro ao carregar custos das ferramentas.");
    else setToolCosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchToolCosts(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'credit_cost' ? parseInt(value, 10) : value }));
  };

  const handleSwitchChange = (checked: boolean) => { setFormData(prev => ({ ...prev, is_active: checked })); };

  const handleOpenDialog = (tool: ToolCost | null = null) => {
    if (tool) { setEditingTool(tool); setFormData(tool); } 
    else { setEditingTool(null); setFormData({ tool_identifier: '', display_name: '', credit_cost: 0, is_active: true }); }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const { error } = editingTool
      ? await supabase.from('tool_costs').update(formData).eq('id', editingTool.id!)
      : await supabase.from('tool_costs').insert(formData);

    if (error) toast.error("Erro ao salvar ferramenta.");
    else {
      toast.success(`Ferramenta ${editingTool ? 'atualizada' : 'criada'} com sucesso!`);
      setIsDialogOpen(false);
      fetchToolCosts();
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Modelos e Custos</h1><p className="text-muted-foreground">Gestão centralizada dos modelos de IA e seus custos.</p></div>
      <Tabs defaultValue="models">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="costs">Custos das Ferramentas</TabsTrigger><TabsTrigger value="models">Gestão de Modelos</TabsTrigger></TabsList>
        <TabsContent value="costs" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader><CardTitle>Definir Custo em Créditos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                toolCosts.map(tool => {
                  const Icon = toolIcons[tool.tool_identifier] || Bot;
                  return (
                    <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-primary" /><span>{tool.display_name}</span></div>
                      <div className="font-mono">{tool.credit_cost} créditos</div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="models" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Gestão de Modelos/Ferramentas</CardTitle><CardDescription>Crie e edite as ferramentas disponíveis na plataforma.</CardDescription></div>
              <Button onClick={() => handleOpenDialog()}><PlusCircle className="w-4 h-4 mr-2" />Nova Ferramenta</Button>
            </CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toolCosts.map(tool => (
                    <Card key={tool.id} className="bg-background/50">
                      <CardHeader><CardTitle className="flex items-center justify-between">{tool.display_name} <Badge variant={tool.is_active ? "default" : "secondary"}>{tool.is_active ? "Ativo" : "Inativo"}</Badge></CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">ID: <span className="font-mono">{tool.tool_identifier}</span></p>
                        <p className="text-sm text-muted-foreground">Custo: <span className="font-mono">{tool.credit_cost} créditos</span></p>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenDialog(tool)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
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
          <DialogHeader><DialogTitle>{editingTool ? 'Editar Ferramenta' : 'Criar Nova Ferramenta'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="display_name">Nome de Exibição</Label><Input id="display_name" name="display_name" value={formData.display_name} onChange={handleInputChange} /></div>
            <div className="space-y-2"><Label htmlFor="tool_identifier">Identificador (sem espaços)</Label><Input id="tool_identifier" name="tool_identifier" value={formData.tool_identifier} onChange={handleInputChange} /></div>
            <div className="space-y-2"><Label htmlFor="credit_cost">Custo em Créditos</Label><Input id="credit_cost" name="credit_cost" type="number" value={formData.credit_cost} onChange={handleInputChange} /></div>
            <div className="flex items-center space-x-2 pt-2"><Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} /><Label htmlFor="is_active">Ferramenta Ativa</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminModels;