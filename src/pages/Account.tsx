import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Upload, Mail, Settings, CreditCard } from "lucide-react";

const stats = [
  { label: "Criações Totais", value: "142", color: "bg-blue-500" },
  { label: "Curtidas Recebidas", value: "1,234", color: "bg-purple-500" },
  { label: "Publicações", value: "89", color: "bg-pink-500" },
  { label: "Membro desde", value: "Jan 2024", color: "bg-cyan-500" }
];

const Account = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[50rem] h-[50rem] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
              Minha Conta
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas informações e preferências
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Informações Pessoais</h2>
                </div>
                
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                      alt="Avatar"
                      className="w-24 h-24 rounded-full border-2 border-primary"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm" className="mb-2">
                      Alterar Foto
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue="Usuário Conversio" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue="usuario@conversio.studio" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="+244 923 456 789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" defaultValue="Angola" />
                  </div>
                </div>

                <Button className="mt-6">
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Button>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Credits */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Créditos</h2>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-6 text-center mb-4">
                  <div className="text-5xl font-bold gradient-text mb-2">250</div>
                  <p className="text-sm text-muted-foreground">créditos disponíveis</p>
                </div>
                
                <Button className="w-full gradient-primary">
                  Comprar Mais Créditos
                </Button>
              </div>

              {/* Statistics */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
                
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <Badge className={stat.color}>{stat.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-secondary/20 border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4" />
                    Alterar E-mail
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4" />
                    Preferências
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Account;