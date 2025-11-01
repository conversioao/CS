import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Upload, Mail, Settings, CreditCard, Bot, Palette, Copy } from "lucide-react";
import { useState, useRef } from "react";
import { useColorThief } from "use-color-thief";
import { toast } from "sonner";

const Account = () => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { color, palette } = useColorThief(logoSrc, {
    format: 'hex',
    colorCount: 5,
    quality: 10,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!logoSrc) {
      toast.error("Nenhum logotipo carregado", { description: "Por favor, carregue um logotipo primeiro." });
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1000); // Simula análise
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Cor copiada!", { description: text });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">Minha Conta</h1>
            <p className="text-muted-foreground text-lg">Gerencie suas informações e preferências</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6"><User className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Informações Pessoais</h2></div>
                <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" defaultValue="Usuário Conversio" /></div><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue="usuario@conversio.studio" /></div></div>
                <Button className="mt-6"><Settings className="w-4 h-4 mr-2" />Salvar Alterações</Button>
              </div>

              {/* Brand Identity */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6"><Palette className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Identidade da Marca</h2></div>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <Label>Logotipo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-card/50">
                        {logoSrc ? <img src={logoSrc} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()}>Carregar Logo</Button>
                        <Button onClick={handleAnalyze} disabled={!logoSrc || isAnalyzing}>{isAnalyzing ? "Analisando..." : "Analisar Cores"}</Button>
                        <Input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Paleta de Cores</Label>
                    <div className="mt-2 space-y-2">
                      {palette ? (
                        palette.map((colorHex, index) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <div className="w-6 h-6 rounded-md border border-border" style={{ backgroundColor: colorHex }} />
                            <span className="font-mono text-sm">{colorHex}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(colorHex)}><Copy className="w-3 h-3" /></Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Analise um logotipo para ver a paleta.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Credits */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Créditos</h2></div>
                <div className="bg-primary/10 rounded-lg p-6 text-center mb-4"><div className="text-5xl font-bold gradient-text mb-2">250</div><p className="text-sm text-muted-foreground">créditos disponíveis</p></div>
                <Button className="w-full gradient-primary">Comprar Mais Créditos</Button>
              </div>

              {/* WhatsApp Integration */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4"><Bot className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Integração WhatsApp</h2></div>
                <p className="text-sm text-muted-foreground mb-4">Gere imagens diretamente do seu WhatsApp. (Recurso pago)</p>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="whatsapp-number">Seu Nº de WhatsApp</Label>
                  <Input id="whatsapp-number" placeholder="9XX XXX XXX" />
                </div>
                <Button className="w-full">Ativar por 15.000 Kzs/mês</Button>
                <div className="text-center mt-2"><Badge variant="secondary">Status: Inativo</Badge></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Account;