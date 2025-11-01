import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AudioLines, Sparkles, Loader2, Download, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { storeMediaInSupabase } from "@/lib/supabase-storage";
import { useUser } from "@/hooks/useUser";
import PlanExpiredBanner from "@/components/PlanExpiredBanner";

interface GeneratedAudio {
  url: string;
  id: string;
  text: string;
}

const GenerateVoice = () => {
  const { isExpired } = useUser();
  const [text, setText] = useState("");
  const [voiceType, setVoiceType] = useState("Masculino");
  const [style, setStyle] = useState("Profissional");
  const [speed, setSpeed] = useState([1]);
  const [language, setLanguage] = useState("Português (Angola)");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (isExpired) {
      toast.error("Plano gratuito expirado", { description: "Por favor, compre créditos para continuar." });
      return;
    }
    if (!text.trim()) {
      toast.error("Texto necessário", { description: "Por favor, insira o texto para gerar a voz." });
      return;
    }
    setIsLoading(true);
    try {
      toast.info("Gerando áudio...", { description: "A sua narração está a ser criada." });
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockUrl = "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c32-428f-814c-38a1a1452146.mp3";
      
      const [storedUrl] = await storeMediaInSupabase([mockUrl], 'audio');
      const newAudio: GeneratedAudio = { url: storedUrl, id: `${Date.now()}`, text: text.substring(0, 50) + "..." };
      setGeneratedAudios(prev => [newAudio, ...prev]);
      toast.success("Sucesso!", { description: "Áudio gerado com sucesso." });
    } catch (error) {
      toast.error("Erro ao gerar áudio", { description: "Ocorreu um problema. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (audio: GeneratedAudio) => {
    if (playingId === audio.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audio.url;
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        setPlayingId(audio.id);
      }
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversio-voice-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado.");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /><span>Voltar ao Dashboard</span></Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">1 crédito por 1000 caracteres</span></div>
          </div>
          
          {isExpired && <PlanExpiredBanner />}

          <div className="grid lg:grid-cols-[1fr,420px] gap-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-xl shadow-lg p-6 min-h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><AudioLines className="w-5 h-5 text-primary" /></div>Áudios Gerados</h2>
              {isLoading && generatedAudios.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center"><Loader2 className="w-12 h-12 animate-spin text-primary mb-4" /><p>A gerar narração...</p></div>
              ) : generatedAudios.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-4"><AudioLines className="w-10 h-10 text-muted-foreground" /></div><h3 className="text-xl font-bold">Pronto para falar?</h3><p className="text-muted-foreground max-w-md text-sm">Configure as opções e gere sua narração.</p></div>
              ) : (
                <div className="space-y-3 overflow-y-auto -mr-2 pr-2">
                  {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">A gerar novo áudio...</div>}
                  {generatedAudios.map(audio => (
                    <Card key={audio.id} className="bg-card/80"><CardContent className="p-3 flex items-center gap-3">
                      <Button size="icon" variant="outline" onClick={() => togglePlay(audio)}>{playingId === audio.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                      <p className="flex-1 text-sm truncate" title={audio.text}>{audio.text}</p>
                      <Button size="icon" variant="ghost" onClick={() => handleDownload(audio.url)}><Download className="w-4 h-4" /></Button>
                    </CardContent></Card>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Card className="p-6 bg-card/50 backdrop-blur-xl shadow-lg"><div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="voice-text">Descrição da Narração</Label><Textarea id="voice-text" placeholder="Escreva o seu texto aqui..." value={text} onChange={e => setText(e.target.value)} className="min-h-[150px] resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="voice-type">Tipo de Voz</Label><Select value={voiceType} onValueChange={setVoiceType}><SelectTrigger id="voice-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="voice-style">Estilo</Label><Select value={style} onValueChange={setStyle}><SelectTrigger id="voice-style"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Profissional">Profissional</SelectItem><SelectItem value="Casual">Casual</SelectItem><SelectItem value="Animado">Animado</SelectItem></SelectContent></Select></div>
                </div>
                 <div className="space-y-2"><Label htmlFor="language">Idioma</Label><Select value={language} onValueChange={setLanguage}><SelectTrigger id="language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Português (Angola)">Português (Angola)</SelectItem><SelectItem value="Português (Brasil)">Português (Brasil)</SelectItem><SelectItem value="English (US)">English (US)</SelectItem></SelectContent></Select></div>
                <div className="space-y-3 pt-2">
                  <div className="space-y-2"><div className="flex justify-between items-center"><Label>Velocidade</Label><span className="text-xs font-mono">{speed[0].toFixed(2)}x</span></div><Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.05} /></div>
                </div>
              </div></Card>
              <Button size="lg" className="w-full gradient-primary" onClick={handleGenerate} disabled={isLoading || isExpired}>{isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />A Gerar...</> : <><AudioLines className="w-5 h-5 mr-2" />Gerar Voz</>}</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerateVoice;