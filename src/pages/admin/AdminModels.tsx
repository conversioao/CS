import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Wand2, Video, Music, Combine, Loader2, AudioLines } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface ToolCost {
  id: string;
  tool_identifier: string;
  display_name: string;
  credit_cost: number;
}

const toolIcons: { [key: string]: React.ElementType } = {
  generate_image: Sparkles, edit_image: Wand2, combine_image: Combine,
  generate_video: Video, generate_music: Music, generate_voice: AudioLines,
};

const AdminModels = () => {
  const [toolCosts, setToolCosts] = useState<ToolCost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchToolCosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tool_costs').select('*');
    if (error) toast.error("Erro ao carregar custos das ferramentas.");
    else setToolCosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchToolCosts(); }, []);

  const handleCostChange = (id: string, newCost: number) => {
    setToolCosts(currentCosts => currentCosts.map(cost => cost.id === id ? { ...cost, credit_cost: newCost } : cost));
  };

  const handleSaveChanges = async () => {
    const updates = toolCosts.map(({ id, credit_cost }) => supabase.from('tool_costs').update({ credit_cost }).eq('id', id));
    const results = await Promise.all(updates);
    if (results.some(res => res.error)) toast.error("Erro ao salvar alterações.");
    else toast.success("Custos atualizados com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Modelos e Custos</h1><p className="text-muted-foreground">Gestão centralizada dos modelos de IA e seus custos.</p></div>
      <Tabs defaultValue="costs">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="costs">Custos das Ferramentas</TabsTrigger><TabsTrigger value="models" disabled>Gestão de Modelos</TabsTrigger></TabsList>
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
                      <div className="flex items-center gap-2">
                        <Input type="number" value={tool.credit_cost} onChange={(e) => handleCostChange(tool.id, parseInt(e.target.value, 10))} className="w-24 h-9 bg-card" />
                        <Label>créditos</Label>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end mt-6"><Button size="lg" className="gradient-primary" onClick={handleSaveChanges}>Salvar Alterações de Custos</Button></div>
        </TabsContent>
        <TabsContent value="models" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-xl"><CardHeader><CardTitle>Ativar/Desativar Modelos de IA</CardTitle></CardHeader><CardContent><p className="text-center text-muted-foreground py-12">Funcionalidade em desenvolvimento.</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AdminModels;