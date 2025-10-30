import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Music, Sparkles, Loader2, Download, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedMusic {
  url: string;
  id: string;
  title: string;
}

const GenerateMusic = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Kizomba");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(2);
  const [customMode, setCustomMode] = useState(true);
  const [instrumental, setInstrumental] = useState(true);
  const [negativeTags, setNegativeTags] = useState("");
  const [vocalGender, setVocalGender] = useState("m");
  const [styleWeight, setStyleWeight] = useState([0.65]);
  const [weirdnessConstraint, setWeirdnessConstraint] = useState([0.65]);
  const [audioWeight, setAudioWeight] = useState([0.65]);
  const [personaId, setPersonaId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt || !title) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o prompt e o título",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        prompt,
        style,
        title,
        duration: duration * 60, // Convert minutes to seconds
        customMode,
        instrumental,
        model: "V3_5",
        callBackUrl: "https://api.example.com/callback",
        negativeTags: negativeTags || undefined,
        vocalGender,
        styleWeight: styleWeight[0],
        weirdnessConstraint: weirdnessConstraint[0],
        audioWeight: audioWeight[0],
        personaId: personaId || undefined,
      };

      const response = await fetch("https://n8n.conversio.ao/webhook-test/c63887de-3658-4ea7-b7db-42b8b10d3d7a", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar música");
      }

      const data = await response.json();
      
      // Armazenar no Supabase
      let finalUrl = data.url || "https://example.com/music.mp3";
      
      if (data.url) {
        try {
          const userId = getUserId();
          const storeResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-generated-media`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                urls: [data.url],
                user_id: userId,
                media_type: "audio",
              }),
            }
          );

          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            if (storeData.urls && storeData.urls.length > 0) {
              finalUrl = storeData.urls[0];
            }
          }
        } catch (error) {
          console.error("Erro ao armazenar no Supabase:", error);
        }
      }

      const mockMusic: GeneratedMusic = {
        url: finalUrl,
        id: `${Date.now()}`,
        title: title,
      };

      setGeneratedMusic(prev => [mockMusic, ...prev]);

      toast({
        title: "Sucesso!",
        description: "Música gerada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao gerar música:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar música. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserId = () => {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("user_id", userId);
    }
    return userId;
  };

  const togglePlay = (music: GeneratedMusic) => {
    if (playingId === music.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = music.url;
        audioRef.current.play();
        setPlayingId(music.id);
      }
    }
  };

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.mp3`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      
      <DashboardNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">Voltar ao Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold">5 créditos por música</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,420px] gap-4 sm:gap-6">
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />
              
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-base sm:text-2xl">Músicas Geradas</span>
              </h2>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Gerando música...</p>
                </div>
              ) : generatedMusic.length > 0 ? (
                <div className="space-y-4 flex-1 relative z-10">
                  {generatedMusic.map((music) => (
                    <Card key={music.id} className="overflow-hidden bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => togglePlay(music)}
                          >
                            {playingId === music.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h3 className="font-semibold">{music.title}</h3>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(music.url, music.title)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center flex-1 relative z-10">
                  <div className="w-20 h-20 rounded-lg bg-muted/50 backdrop-blur-sm flex items-center justify-center">
                    <Music className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Pronto para criar música?</h3>
                    <p className="text-muted-foreground max-w-md text-sm">
                      Configure os parâmetros e gere sua música com Suno AI
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-xl shadow-lg">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold">Título da Música *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Peaceful Piano Meditation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt" className="font-semibold">Descrição *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ex: A calm and relaxing piano track with soft melodies"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style" className="font-semibold">Estilo Musical</Label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Kizomba">Kizomba</option>
                    <option value="Semba">Semba</option>
                    <option value="Kuduro">Kuduro</option>
                    <option value="Afrobeat">Afrobeat</option>
                    <option value="Zouk">Zouk</option>
                    <option value="Afro House">Afro House</option>
                    <option value="Kazukuta">Kazukuta</option>
                    <option value="Rebita">Rebita</option>
                    <option value="Kilapanga">Kilapanga</option>
                    <option value="Classical">Classical</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Rock">Rock</option>
                    <option value="Pop">Pop</option>
                    <option value="Electronic">Electronic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="font-semibold">Duração (minutos): {duration}</Label>
                  <input
                    type="range"
                    id="duration"
                    min="1"
                    max="10"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    disabled={isLoading}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 min</span>
                    <span>10 min</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negativeTags" className="font-semibold">Tags Negativas (opcional)</Label>
                  <Input
                    id="negativeTags"
                    placeholder="Ex: Heavy Metal, Upbeat Drums"
                    value={negativeTags}
                    onChange={(e) => setNegativeTags(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personaId" className="font-semibold">Persona ID (opcional)</Label>
                  <Input
                    id="personaId"
                    placeholder="Ex: persona_123"
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="customMode" className="font-semibold">Modo Customizado</Label>
                  <Switch
                    id="customMode"
                    checked={customMode}
                    onCheckedChange={setCustomMode}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="instrumental" className="font-semibold">Instrumental</Label>
                  <Switch
                    id="instrumental"
                    checked={instrumental}
                    onCheckedChange={setInstrumental}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vocalGender" className="font-semibold">Gênero Vocal</Label>
                  <select
                    id="vocalGender"
                    value={vocalGender}
                    onChange={(e) => setVocalGender(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="m">Masculino</option>
                    <option value="f">Feminino</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Peso do Estilo: {styleWeight[0]}</Label>
                  <Slider
                    value={styleWeight}
                    onValueChange={setStyleWeight}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Restrição de Estranheza: {weirdnessConstraint[0]}</Label>
                  <Slider
                    value={weirdnessConstraint}
                    onValueChange={setWeirdnessConstraint}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Peso do Áudio: {audioWeight[0]}</Label>
                  <Slider
                    value={audioWeight}
                    onValueChange={setAudioWeight}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </Card>

            <Button 
              className="w-full h-11 sm:h-12 font-semibold text-sm sm:text-base" 
              size="lg"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  Gerar Música
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateMusic;
