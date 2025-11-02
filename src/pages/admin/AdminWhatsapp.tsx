import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionRequest {
  id: string;
  whatsapp_number: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    whatsapp_number: string;
  }
}

const AdminWhatsapp = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_subscriptions')
      .select(`
        id,
        whatsapp_number,
        status,
        created_at,
        profiles (
          full_name,
          whatsapp_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao buscar solicitações.");
    } else {
      setRequests(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateRequest = async (id: string, newStatus: 'active' | 'rejected') => {
    const { error } = await supabase
      .from('whatsapp_subscriptions')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      toast.error(`Erro ao ${newStatus === 'active' ? 'aprovar' : 'rejeitar'} a solicitação.`);
    } else {
      toast.success(`Solicitação ${newStatus === 'active' ? 'aprovada' : 'rejeitada'} com sucesso.`);
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscrições WhatsApp</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de integração com o WhatsApp.</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Solicitações Pendentes e Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div className="rounded-lg border border-border/50">
              <Table>
                <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Nº WhatsApp</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>{req.profiles.full_name}</div>
                        <div className="text-xs text-muted-foreground">{req.profiles.whatsapp_number}</div>
                      </TableCell>
                      <TableCell>{req.whatsapp_number}</TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleDateString('pt-AO')}</TableCell>
                      <TableCell><Badge variant={req.status === 'active' ? 'default' : req.status === 'pending_approval' ? 'secondary' : 'destructive'}>{req.status}</Badge></TableCell>
                      <TableCell>
                        {req.status === 'pending_approval' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(req.id, 'active')}><Check className="w-4 h-4 mr-1" />Aprovar</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest(req.id, 'rejected')}><X className="w-4 h-4 mr-1" />Rejeitar</Button>
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
    </div>
  );
};

export default AdminWhatsapp;