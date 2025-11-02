import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search } from "lucide-react";

const users = [
  { id: 1, name: "João Silva", email: "joao@exemplo.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao", status: "Ativo", plan: "Pro", credits: 450, joined: "15/07/2024" },
  { id: 2, name: "Maria Costa", email: "maria@exemplo.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", status: "Ativo", plan: "Starter", credits: 80, joined: "12/07/2024" },
  { id: 3, name: "Pedro Santos", email: "pedro@exemplo.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro", status: "Inativo", plan: "Free", credits: 0, joined: "10/07/2024" },
  { id: 4, name: "Ana Pereira", email: "ana@exemplo.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana", status: "Ativo", plan: "Studio", credits: 1200, joined: "05/07/2024" },
];

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">Gerencie todos os usuários da plataforma.</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
          <CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar por nome ou e-mail..." className="pl-10 bg-background/50" />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead>Data de Registo</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="border-border/50 hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Ativo" ? "default" : "secondary"} className={user.status === "Ativo" ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-border"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.plan}</TableCell>
                    <TableCell className="text-right font-mono">{user.credits}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500">Suspender</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminUsers;