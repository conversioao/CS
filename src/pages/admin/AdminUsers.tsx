import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserProfile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  status: string;
  plan: string;
  credits: number;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newCredits, setNewCredits] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*');
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,whatsapp_number.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao buscar usuários.");
    } else {
      setUsers(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleUpdateCredits = async () => {
    if (!editingUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', editingUser.id);
    if (error) {
      toast.error("Erro ao atualizar créditos.");
    } else {
      toast.success("Créditos atualizados com sucesso.");
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleUpdateStatus = async (user: UserProfile, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', user.id);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success("Status do usuário atualizado.");
      fetchUsers();
    }
  };

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
              <Input placeholder="Pesquisar por nome ou e-mail..." className="pl-10 bg-background/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
            <div className="rounded-lg border border-border/50">
              <Table>
                <TableHeader><TableRow className="border-border/50"><TableHead>Usuário</TableHead><TableHead>Status</TableHead><TableHead>Plano</TableHead><TableHead className="text-right">Créditos</TableHead><TableHead>Data de Registo</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="border-border/50 hover:bg-muted/20">
                      <TableCell><div className="flex items-center gap-3"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} alt={user.full_name} className="w-8 h-8 rounded-full" /><div><div className="font-medium">{user.full_name}</div><div className="text-sm text-muted-foreground">{user.whatsapp_number}</div></div></div></TableCell>
                      <TableCell><Badge variant={user.status === "verified" ? "default" : "secondary"} className={user.status === "verified" ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-border"}>{user.status}</Badge></TableCell>
                      <TableCell>{user.plan}</TableCell>
                      <TableCell className="text-right font-mono">{user.credits}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('pt-AO')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setEditingUser(user); setNewCredits(user.credits); }}>Editar Créditos</DropdownMenuItem>
                            {user.status !== 'suspended' ? <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={() => handleUpdateStatus(user, 'suspended')}>Suspender</DropdownMenuItem> : <DropdownMenuItem onClick={() => handleUpdateStatus(user, 'verified')}>Reativar</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Créditos de {editingUser?.full_name}</DialogTitle></DialogHeader>
          <div className="py-4"><Label htmlFor="credits">Créditos</Label><Input id="credits" type="number" value={newCredits} onChange={(e) => setNewCredits(parseInt(e.target.value, 10))} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button><Button onClick={handleUpdateCredits}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminUsers;