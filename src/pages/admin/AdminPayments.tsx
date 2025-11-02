import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Check, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Payment {
  id: string;
  profiles: { full_name: string } | null;
  credit_packages: { name: string } | null;
  amount: number;
  payment_method: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const PaymentsTable = ({ statusFilter }: { statusFilter?: 'pending' | 'approved' | 'rejected' }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select(`
        id,
        amount,
        payment_method,
        proof_url,
        status,
        created_at,
        profiles:user_id (full_name),
        credit_packages:package_id (name)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao buscar pagamentos.", {
        description: error.message,
      });
    } else {
      setPayments(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleUpdatePayment = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('payments')
      .update({ status: newStatus, processed_at: new Date() })
      .eq('id', id);

    if (error) {
      toast.error(`Erro ao ${newStatus === 'approved' ? 'aprovar' : 'rejeitar'} o pagamento.`, {
        description: error.message,
      });
    } else {
      toast.success(`Pagamento ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`);
      fetchPayments();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Pacote</TableHead><TableHead>Valor</TableHead><TableHead>Comprovativo</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
        <TableBody>
          {payments.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.profiles?.full_name || 'N/A'}</TableCell>
              <TableCell>{p.credit_packages?.name || 'N/A'}</TableCell>
              <TableCell>{p.amount.toLocaleString('pt-AO')} Kzs</TableCell>
              <TableCell><Button variant="outline" size="sm" asChild><a href={p.proof_url} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 mr-2" />Ver</a></Button></TableCell>
              <TableCell><Badge variant={p.status === "approved" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge></TableCell>
              <TableCell>
                {p.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdatePayment(p.id, 'approved')}><Check className="w-4 h-4 mr-1" />Aprovar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdatePayment(p.id, 'rejected')}><X className="w-4 h-4 mr-1" />Rejeitar</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AdminPayments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie todas as transações da plataforma.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle><CardDescription>Aprove ou rejeite pagamentos pendentes.</CardDescription></CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><PaymentsTable /></TabsContent>
            <TabsContent value="pending"><PaymentsTable statusFilter="pending" /></TabsContent>
            <TabsContent value="approved"><PaymentsTable statusFilter="approved" /></TabsContent>
            <TabsContent value="rejected"><PaymentsTable statusFilter="rejected" /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminPayments;