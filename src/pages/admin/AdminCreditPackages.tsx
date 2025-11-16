import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface CreditPackage {
  id?: string;
  name: string;
  price: number;
  credits_amount: number;
  description: string;
  is_active: boolean;
}

const AdminCreditPackages = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [formData, setFormData] = useState<CreditPackage>({ name: '', price: 0, credits_amount: 0, description: '', is_active: true });

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('credit_packages').select('*').order('price');
    if (error) toast.error("Erro ao carregar pacotes.");
    else setPackages(data);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'credits_amount' ? parseFloat(value) : value }));
  };

  const handleSwitchChange = (checked: boolean) => { setFormData(prev => ({ ...prev, is_active: checked })); };

  const handleOpenDialog = (pkg: CreditPackage | null = null) => {
    if (pkg) { setEditingPackage(pkg); setFormData(pkg); } 
    else { setEditingPackage(null); setFormData({ name: '', price: 0, credits_amount: 0, description: '', is_active: true }); }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const { error } = editingPackage
      ? await supabase.from('credit_packages').update(formData).eq('id', editingPackage.id!)
      : await supabase.from('credit_packages').insert(formData);

    if (error) toast.error("Erro ao salvar pacote.");
    else {
      toast.success(`Pacote ${editingPackage ? 'atualizado' : 'criado'} com sucesso!`);
      setIsDialogOpen(false);
      fetchPackages();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Pacotes de Crédito</h1><p className="text-muted-foreground">Crie e gerencie os pacotes de créditos.</p></div>
        <Button onClick={() => handleOpenDialog()}><PlusCircle className="w-4 h-4 mr-2" />Criar Novo Pacote</Button>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <Card key={pkg.id} className="bg-card/50 backdrop-blur-xl flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{pkg.name}</CardTitle>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>{pkg.is_active ? "Ativo" : "Inativo"}</Badge>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <div className="text-3xl font-bold">{pkg.price.toLocaleString('pt-AO')} Kzs</div>
                  <div className="text-lg text-primary flex items-center gap-2"><Sparkles className="w-4 h-4" /> {pkg.credits_amount} Créditos</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(pkg)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editingPackage ? 'Editar Pacote' : 'Criar Novo Pacote'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="bg-background/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="price">Preço (Kzs)</Label><Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} className="bg-background/50" /></div>
              <div className="space-y-2"><Label htmlFor="credits_amount">Créditos</Label><Input id="credits_amount" name="credits_amount" type="number" value={formData.credits_amount} onChange={handleInputChange} className="bg-background/50" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" placeholder="Ex: Imagens em alta resolução, Suporte básico..." value={formData.description} onChange={handleInputChange} className="bg-background/50" /></div>
            <div className="flex items-center space-x-2 pt-2"><Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} /><Label htmlFor="is_active">Pacote Ativo</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCreditPackages;