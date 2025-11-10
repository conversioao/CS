import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Sparkles, Trophy, TrendingUp, Users, Award, Upload, Eye, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CommunitySubmission {
  id: string;
  user_id: string;
  media_url: string;
  title: string;
  description: string;
  likes: number;
  views: number;
  score: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

const Community = () => {
  const { user, profile } = useSession();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [mySubmissions, setMySubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    
    try {
      // Fetch approved submissions ordered by score
      const { data: approvedData, error: approvedError } = await supabase
        .from('community_submissions')
        .select('*, profiles(full_name)')
        .eq('status', 'approved')
        .order('score', { ascending: false })
        .limit(20);

      if (approvedError) {
        console.error('Error fetching approved submissions:', approvedError);
        toast.error("Erro ao carregar criações da comunidade");
      } else {
        setSubmissions(approvedData || []);
      }

      // Fetch user's submissions
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('community_submissions')
          .select('*, profiles(full_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userError) {
          console.error('Error fetching user submissions:', userError);
        } else {
          setMySubmissions(userData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Erro ao carregar dados da comunidade");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !user) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('community-submissions')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('community-submissions')
        .getPublicUrl(fileName);

      // Insert submission record
      const { error: insertError } = await supabase
        .from('community_submissions')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          title,
          description,
          score: 0 // Initial score
        });

      if (insertError) throw insertError;

      toast.success("Criação enviada com sucesso! Aguarde a aprovação.");
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchSubmissions();
    } catch (error: any) {
      console.error('Error uploading submission:', error);
      toast.error("Erro ao enviar criação: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (id: string) => {
    // In a real implementation, this would update the like count
    // and track which users have liked which submissions
    toast.info("Sistema de curtidas em desenvolvimento");
  };

  const calculateScore = (submission: CommunitySubmission) => {
    // Simple scoring algorithm: views + (likes * 2)
    return submission.views + (submission.likes * 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:block"><DashboardSidebar /></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </main>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
                Comunidade Conversio
              </h1>
              <p className="text-muted-foreground text-lg">
                Compartilhe, inspire-se e ganhe recompensas
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Criação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enviar para a Comunidade</h3>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Dê um título criativo à sua criação"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Conte-nos sobre sua criação..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Imagem *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile || !title}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar para Aprovação"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Todas as criações são revisadas antes de serem publicadas.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="trending">Em Alta</TabsTrigger>
              <TabsTrigger value="my">Minhas</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={submission.media_url}
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                          <Eye className="w-4 h-4 text-white" />
                          <span className="text-white text-xs">{submission.views}</span>
                        </div>
                        <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 text-white" />
                          <span className="text-white text-xs">{submission.likes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                            {submission.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium">
                            {submission.profiles?.full_name || 'Usuário'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleLike(submission.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma criação publicada ainda.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...submissions]
                  .sort((a, b) => calculateScore(b) - calculateScore(a))
                  .slice(0, 6)
                  .map((submission) => (
                    <div
                      key={submission.id}
                      className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={submission.media_url}
                          alt={submission.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-bold">
                            {calculateScore(submission)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{submission.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                              {submission.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium">
                              {submission.profiles?.full_name || 'Usuário'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleLike(submission.id)}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma criação em alta ainda.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={submission.media_url}
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant={
                            submission.status === 'approved'
                              ? 'default'
                              : submission.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {submission.status === 'approved'
                            ? 'Aprovado'
                            : submission.status === 'pending'
                            ? 'Pendente'
                            : 'Rejeitado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(submission.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {submission.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {submission.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mySubmissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Você ainda não enviou nenhuma criação.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">Enviar Primeira Criação</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Enviar para a Comunidade</h3>
                        <div className="space-y-2">
                          <Label htmlFor="title">Título *</Label>
                          <Input
                            id="title"
                            placeholder="Dê um título criativo à sua criação"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            placeholder="Conte-nos sobre sua criação..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="file">Imagem *</Label>
                          <Input
                            id="file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                        {previewUrl && (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        )}
                        <Button
                          className="w-full"
                          onClick={handleUpload}
                          disabled={uploading || !selectedFile || !title}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar para Aprovação"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Community;