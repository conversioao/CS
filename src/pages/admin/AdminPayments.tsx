import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Check, X, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Payment {
  id: string;
  profiles: { full_name: string } | null;
  credit_packages: { name: string } | null;
  amount: number;
  payment_method: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at: string | null;
  user_id: string;
}

const rejectionReasons = [
  "Comprovativo inválido ou ilegível",
  "Valor da transferência incorreto",
  "A transferência não foi recebida",
  "Outro (especificar abaixo)",
];

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejectionMessage, setCustomRejectionMessage] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    let query = supabase.from('payments').select(`id, amount, payment_method, proof_url, status, created_at, processed_at, user_id, profiles:user_id (full_name), credit_packages:package_id (name)`).order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (searchTerm) query = query.ilike('profiles.full_name', `%${searchTerm}%`);
    
    const { data, error } = await query;
    if (error) toast.error("Erro ao buscar pagamentos.", { description: error.message });
    else setPayments(data as any);
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchPayments(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchTerm]);

  const handleUpdatePayment = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('payments').update({ status: newStatus, processed_at: new Date() }).eq('id', id);
    if (error) toast.error(`Erro ao ${newStatus === 'approved' ? 'aprovar' : 'rejeitar'} o pagamento.`);
    else {
      toast.success(`Pagamento ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`);
      fetchPayments();
    }
  };

  const handleOpenRejectModal = (payment: Payment) => {
    setPaymentToReject(payment);
    setIsRejectModalOpen(true);
  };

  const handleRejectPayment = async () => {
    if (!paymentToReject || !rejectionReason) return;
    
    const finalMessage = rejectionReason === "Outro (especificar abaixo)" ? customRejectionMessage : rejectionReason;
    
    // 1. Update payment status
    await handleUpdatePayment(paymentToReject.id, 'rejected');

    // 2. Send notification
    await supabase.from('notifications').insert({
      user_id: paymentToReject.user_id,
      title: "Pagamento Rejeitado",
      message: `O seu pagamento para o pacote ${paymentToReject.credit_packages?.name} foi rejeitado. Motivo: ${finalMessage}`,
    });

    toast.info("Notificação de rejeição enviada ao usuário.");
    setIsRejectModalOpen(false);
    setRejectionReason("");
    setCustomRejectionMessage("");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Pagamentos</h1><p className="text-muted-foreground">Gerencie todas as transações da plataforma.</p></div>
      <Card className="bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full md:w-auto"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pesquisar por nome..." className="pl-10 bg-background/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}><SelectTrigger className="w-full md:w-[180px] bg-background/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">Pendentes</SelectItem><SelectItem value="approved">Aprovados</SelectItem><SelectItem value="rejected">Rejeitados</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
            <div className="rounded-lg border border-border/50">
              <Table>
                <TableHeader><TableRow className="border-border/50"><TableHead>Usuário</TableHead><TableHead>Pacote</TableHead><TableHead>Valor</TableHead><TableHead>Comprovativo</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p.id} className="border-border/50 hover:bg-muted/20">
                      <TableCell>{p.profiles?.full_name || 'N/A'}</TableCell>
                      <TableCell>{p.credit_packages?.name || 'N/A'}</TableCell>
                      <TableCell>{p.amount.toLocaleString('pt-AO')} Kzs</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><a href={p.proof_url} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 mr-2" />Ver</a></Button></TableCell>
                      <TableCell><Badge variant={p.status === "approved" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge></TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString('pt-AO')}</TableCell>
                      <TableCell>
                        {p.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdatePayment(p.id, 'approved')}><Check className="w-4 h-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleOpenRejectModal(p)}><X className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejeitar Pagamento</DialogTitle><DialogDescription>Selecione um motivo para a rejeição. O usuário será notificado.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label htmlFor="rejection-reason">Motivo da Rejeição</Label><Select onValueChange={setRejectionReason}><SelectTrigger><SelectValue placeholder="Selecione um motivo..." /></SelectTrigger><SelectContent>{rejectionReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
            {rejectionReason === "Outro (especificar abaixo)" && <div className="space-y-2"><Label htmlFor="custom-message">Mensagem Personalizada</Label><Textarea id="custom-message" value={customRejectionMessage} onChange={(e) => setCustomRejectionMessage(e.target.value)} /></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleRejectPayment}>Confirmar Rejeição</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminPayments;