import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, Loader2, PlusCircle, Trash2, Edit, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  status: string;
  plan: string;
  credits: number;
  created_at: string;
  account_type: 'user' | 'admin' | 'affiliate';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*');
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,whatsapp_number.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao buscar usuários.", { description: error.message });
    } else {
      setUsers(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: editingUser.full_name,
        credits: editingUser.credits,
        status: editingUser.status,
        account_type: editingUser.account_type
      })
      .eq('id', editingUser.id);
    if (error) {
      toast.error("Erro ao atualizar usuário.", { description: error.message });
    } else {
      toast.success("Usuário atualizado com sucesso.");
      setIsEditModalOpen(false);
      fetchUsers();
    }
  };

  const handleOpenDeleteModal = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
    if (error) {
      toast.error("Erro ao eliminar usuário.", { description: error.message });
    } else {
      toast.success("Usuário eliminado com sucesso.");
      setIsDeleteModalOpen(false);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários da plataforma.</p>
        </div>
        <Button disabled><PlusCircle className="w-4 h-4 mr-2" />Novo Usuário</Button>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pesquisar por nome ou e-mail..." className="pl-10 bg-background/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
            <div className="rounded-lg border border-border/50">
              <Table>
                <TableHeader><TableRow className="border-border/50"><TableHead>Usuário</TableHead><TableHead>Status</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Créditos</TableHead><TableHead>Data de Registo</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="border-border/50 hover:bg-muted/20">
                      <TableCell>
                        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} alt={user.full_name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">{user.whatsapp_number}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant={user.status === "verified" ? "default" : "secondary"} className={user.status === "verified" ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-border"}>{user.status}</Badge></TableCell>
                      <TableCell>{user.account_type}</TableCell>
                      <TableCell className="text-right font-mono">{user.credits}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('pt-AO')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/users/${user.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={() => handleOpenDeleteModal(user)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
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
      
      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          {editingUser && <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="full_name">Nome Completo</Label><Input id="full_name" value={editingUser.full_name} onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="credits">Créditos</Label><Input id="credits" type="number" value={editingUser.credits} onChange={(e) => setEditingUser({...editingUser, credits: parseInt(e.target.value, 10)})} /></div>
            <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={editingUser.status} onValueChange={(value) => setEditingUser({...editingUser, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="verified">Verificado</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="suspended">Suspenso</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="account_type">Tipo de Conta</Label><Select value={editingUser.account_type} onValueChange={(value) => setEditingUser({...editingUser, account_type: value as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">Usuário</SelectItem><SelectItem value="affiliate">Afiliado</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button><Button onClick={handleUpdateUser}>Salvar Alterações</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Eliminação</DialogTitle><DialogDescription>Tem a certeza que deseja eliminar o usuário {userToDelete?.full_name}? Esta ação é irreversível.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteUser}>Eliminar Usuário</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminUsers;