import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, Plus, Edit, Trash2, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input as InputComponent } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'Free Trial' | 'Paid';
  credits: number;
  joined: string;
  account_type: 'user' | 'affiliate' | 'admin';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "active",
    plan: "Free Trial",
    credits: 0,
    account_type: "user"
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao buscar usuários.");
    } else {
      const formattedUsers = data.map(profile => ({
        id: profile.id,
        name: profile.full_name || "Usuário",
        email: profile.email || "user@example.com",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name || 'user'}`,
        status: profile.status || 'active',
        plan: profile.plan || 'Free Trial',
        credits: profile.credits || 0,
        joined: new Date(profile.created_at).toLocaleDateString('pt-AO'),
        account_type: profile.account_type || 'user'
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      status: user.status,
      plan: user.plan,
      credits: user.credits,
      account_type: user.account_type
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error("Erro ao excluir usuário.");
      } else {
        toast.success("Usuário excluído com sucesso.");
        fetchUsers();
      }
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name,
        email: formData.email,
        status: formData.status,
        plan: formData.plan,
        credits: formData.credits,
        account_type: formData.account_type
      })
      .eq('id', selectedUser.id);

    if (error) {
      toast.error("Erro ao atualizar usuário.");
    } else {
      toast.success("Usuário atualizado com sucesso.");
      setIsDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const handleCreateUser = async () => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        full_name: formData.name,
        email: formData.email,
        status: formData.status,
        plan: formData.plan,
        credits: formData.credits,
        account_type: formData.account_type
      });

    if (error) {
      toast.error("Erro ao criar usuário.");
    } else {
      toast.success("Usuário criado com sucesso.");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        status: "active",
        plan: "Free Trial",
        credits: 0,
        account_type: "user"
      });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários da plataforma.</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setFormData({
            name: "",
            email: "",
            status: "active",
            plan: "Free Trial",
            credits: 0,
            account_type: "user"
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
          <CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou e-mail..."
                className="pl-10 bg-background/50"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                  {filteredUsers.map(user => (
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
                        <Badge variant={user.status === "active" ? "default" : user.status === "inactive" ? "secondary" : "destructive"}>
                          {user.status === "active" ? "Ativo" : user.status === "inactive" ? "Inativo" : "Suspenso"}
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
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(user.id)} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                            {user.account_type !== 'admin' && (
                              <DropdownMenuItem onClick={() => {
                                const newType = user.account_type === 'user' ? 'affiliate' : 'user';
                                handleEditClick({...user, account_type: newType});
                              }}>
                                <User className="w-4 h-4 mr-2" />
                                {user.account_type === 'user' ? 'Tornar Afiliado' : 'Tornar Usuário'}
                              </DropdownMenuItem>
                            )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <InputComponent
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <InputComponent
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value as any})}>
                  <SelectTrigger id="plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free Trial">Free Trial</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Créditos</Label>
                <InputComponent
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Tipo de Conta</Label>
                <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value as any})}>
                  <SelectTrigger id="account_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="affiliate">Afiliado</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedUser ? handleSaveUser : handleCreateUser}>
              {selectedUser ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;