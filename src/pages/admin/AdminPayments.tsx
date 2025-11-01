import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Check, X } from "lucide-react";

const payments = [
  { id: "PAY001", user: "João Silva", plan: "Pro", amount: "49.950 Kzs", method: "Transferência", proof: "#", status: "Pendente", date: "20/07/2024" },
  { id: "PAY002", user: "Maria Costa", plan: "Starter", amount: "14.950 Kzs", method: "Multicaixa", proof: "#", status: "Aprovado", date: "18/07/2024" },
  { id: "PAY003", user: "Ana Pereira", plan: "Studio", amount: "124.950 Kzs", method: "Kwik", proof: "#", status: "Pendente", date: "21/07/2024" },
  { id: "PAY004", user: "Pedro Santos", plan: "Starter", amount: "14.950 Kzs", method: "Transferência", proof: "#", status: "Rejeitado", date: "15/07/2024" },
];

const PaymentsTable = ({ statusFilter }: { statusFilter?: string }) => {
  const filteredPayments = statusFilter ? payments.filter(p => p.status === statusFilter) : payments;
  return (
    <div className="rounded-lg border border-border/50">
      <Table>
        <TableHeader><TableRow className="border-border/50"><TableHead>ID</TableHead><TableHead>Usuário</TableHead><TableHead>Plano</TableHead><TableHead>Valor</TableHead><TableHead>Comprovativo</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
        <TableBody>
          {filteredPayments.map(p => (
            <TableRow key={p.id} className="border-border/50 hover:bg-muted/20">
              <TableCell className="font-mono text-xs">{p.id}</TableCell>
              <TableCell>{p.user}</TableCell>
              <TableCell>{p.plan}</TableCell>
              <TableCell>{p.amount}</TableCell>
              <TableCell><Button variant="outline" size="sm" asChild><a href={p.proof} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 mr-2" />Ver</a></Button></TableCell>
              <TableCell><Badge variant={p.status === "Aprovado" ? "default" : p.status === "Pendente" ? "secondary" : "destructive"} className={p.status === "Aprovado" ? "bg-green-500/20 text-green-400 border-green-500/30" : p.status === "Pendente" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "border-red-500/30"}>{p.status}</Badge></TableCell>
              <TableCell>
                {p.status === "Pendente" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-1" />Aprovar</Button>
                    <Button size="sm" variant="destructive"><X className="w-4 h-4 mr-1" />Rejeitar</Button>
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
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><PaymentsTable /></TabsContent>
            <TabsContent value="pending"><PaymentsTable statusFilter="Pendente" /></TabsContent>
            <TabsContent value="approved"><PaymentsTable statusFilter="Aprovado" /></TabsContent>
            <TabsContent value="rejected"><PaymentsTable statusFilter="Rejeitado" /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminPayments;