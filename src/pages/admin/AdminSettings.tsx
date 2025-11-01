import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Configurações Gerais</CardTitle><CardDescription>Configurações básicas do sistema.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="site-name">Nome do Site</Label><Input id="site-name" defaultValue="Conversio Studio" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5"><Label>Modo de Manutenção</Label><p className="text-sm text-muted-foreground">Desativa o acesso para usuários normais.</p></div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Configurações de Pagamento</CardTitle><CardDescription>Informações para pagamentos manuais.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="bank-iban">IBAN para Transferências</Label><Input id="bank-iban" placeholder="AO06..." /></div>
            <div className="space-y-2"><Label htmlFor="mc-ref">Referência Multicaixa</Label><Input id="mc-ref" placeholder="987 654 321" /></div>
            <div className="space-y-2"><Label htmlFor="kwik-phone">Nº Kwik</Label><Input id="kwik-phone" placeholder="+244 9XX XXX XXX" /></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Integrações de API</CardTitle><CardDescription>Gerencie as chaves de API para serviços externos.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="n8n-webhook">Webhook N8N</Label><Input id="n8n-webhook" type="password" defaultValue="******************" /></div>
            <div className="space-y-2"><Label htmlFor="imgbb-key">Chave API ImgBB</Label><Input id="imgbb-key" type="password" defaultValue="******************" /></div>
            <div className="space-y-2"><Label htmlFor="suno-key">Chave API Suno</Label><Input id="suno-key" type="password" defaultValue="******************" /></div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button size="lg">Salvar Todas as Configurações</Button>
      </div>
    </div>
  );
};
export default AdminSettings;