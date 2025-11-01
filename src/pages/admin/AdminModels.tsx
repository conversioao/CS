import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Wand2, Video, Music, Combine } from "lucide-react";

const models = [
  { id: "persona", name: "Modelo Persona", icon: Sparkles, cost: 2 },
  { id: "pulse", name: "Modelo Pulse", icon: Sparkles, cost: 2 },
  { id: "styleai", name: "Modelo StyleAI", icon: Sparkles, cost: 3 },
  { id: "vision", name: "Modelo Vision", icon: Sparkles, cost: 3 },
];

const tools = [
  { id: "edit", name: "Edição de Imagem", icon: Wand2, cost: 1 },
  { id: "combine", name: "Combinação de Imagem", icon: Combine, cost: 2 },
  { id: "video", name: "Geração de Vídeo", icon: Video, cost: 3 },
  { id: "music", name: "Geração de Música", icon: Music, cost: 5 },
];

const AdminModels = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Modelos e Custos</h1>
      <p className="text-muted-foreground">Defina o custo em créditos para cada modelo e ferramenta de IA.</p>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" /> Custos dos Modelos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {models.map(model => {
              const Icon = model.icon;
              return (
                <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-primary" /><span>{model.name}</span></div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={model.cost} className="w-20 h-8" />
                    <Label>créditos</Label>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Custos das Ferramentas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-primary" /><span>{tool.name}</span></div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={tool.cost} className="w-20 h-8" />
                    <Label>créditos</Label>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button size="lg">Salvar Alterações</Button>
      </div>
    </div>
  );
};
export default AdminModels;