import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Check, X, Loader2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Payment {
  id: string;
  user: { full_name: string };
  package: { name: string };
  amount: number;
  payment_method: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState("");

  const fetchPayments = async (status?: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select(`
        id,
        amount,
        payment_method,
        proof_url,
        status,
        notes,
        created_at,
        user:profiles (full_name),
        package:credit_packages (name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao buscar pagamentos.");
    } else {
      setPayments(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdatePayment = async (id: string, newStatus: 'approved' | 'rejected', notes?: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: newStatus, 
        processed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', id);

    if (error) {
      toast.error(`Erro ao ${newStatus === 'approved' ? 'aprovar' : 'rejeitar'} o pagamento.`);
    } else {
      toast.success(`Pagamento ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`);
      fetchPayments();
    }
  };

  const handleActionClick = (payment: Payment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setDialogAction(action);
    setNotes(payment.notes || "");
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedPayment && dialogAction) {
      handleUpdatePayment(selectedPayment.id, dialogAction, notes);
      setIsDialogOpen(false);
      setSelectedPayment(null);
      setDialogAction(null);
      setNotes("");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie todas as transações da plataforma.</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <PaymentsTable 
                payments={payments} 
                onActionClick={handleActionClick}
                onViewClick={(payment) => window.open(payment.proof_url, '_blank')}
              />
            </TabsContent>
            <TabsContent value="pending">
              <PaymentsTable 
                payments={payments.filter(p => p.status === 'pending')} 
                onActionClick={handleActionClick}
                onViewClick={(payment) => window.open(payment.proof_url, '_blank')}
              />
            </TabsContent>
            <TabsContent value="approved">
              <PaymentsTable 
                payments={payments.filter(p => p.status === 'approved')} 
                onViewClick={(payment) => window.open(payment.proof_url, '_blank')}
              />
            </TabsContent>
            <TabsContent value="rejected">
              <PaymentsTable 
                payments={payments.filter(p => p.status === 'rejected')} 
                onViewClick={(payment) => window.open(payment.proof_url, '_blank')}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Aprovar Pagamento' : 'Rejeitar Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve' 
                ? 'Tem certeza que deseja aprovar este pagamento?' 
                : 'Por favor, informe o motivo da rejeição.'}
            </DialogDescription>
          </DialogHeader>
          {dialogAction === 'reject' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Motivo da Rejeição</Label>
                <Textarea
                  id="notes"
                  placeholder="Informe o motivo pelo qual este pagamento foi rejeitado..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmAction}>
              {dialogAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PaymentsTableProps {
  payments: Payment[];
  onActionClick?: (payment: Payment, action: 'approve' | 'reject') => void;
  onViewClick?: (payment: Payment) => void;
}

const PaymentsTable = ({ payments, onActionClick, onViewClick }: PaymentsTableProps) => {
  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Pacote</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.user?.full_name || 'N/A'}</TableCell>
              <TableCell>{p.package?.name || 'N/A'}</TableCell>
              <TableCell>{p.amount.toLocaleString('pt-AO')} Kzs</TableCell>
              <TableCell className="capitalize">{p.payment_method}</TableCell>
              <TableCell>
                <Badge variant={p.status === "approved" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                  {p.status === "approved" ? "Aprovado" : p.status === "pending" ? "Pendente" : "Rejeitado"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(p.created_at).toLocaleDateString('pt-AO')}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onViewClick && (
                    <Button size="sm" variant="outline" onClick={() => onViewClick(p)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {p.status === "pending" && onActionClick && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onActionClick(p, 'approve')}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onActionClick(p, 'reject')}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminPayments;