import { useState, useRef, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const ChatCriativo = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Olá! Como posso te ajudar a ser mais criativo hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.conversio.ao/webhook-test/chatcriativo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Ocorreu um erro ao buscar a resposta da IA.');
      }

      // Assumindo que o webhook pode retornar um JSON com uma chave 'response' ou texto puro
      const contentType = response.headers.get("content-type");
      let aiText = "";
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        aiText = data.response || data.text || "Não recebi uma resposta válida.";
      } else {
        aiText = await response.text();
      }

      const aiMessage: Message = { sender: "ai", text: aiText };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
      const aiErrorMessage: Message = { sender: "ai", text: `Desculpe, ocorreu um erro: ${errorMessage}` };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><DashboardSidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          </div>
          
          <div className="flex-1 flex flex-col bg-card/50 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
            <header className="p-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ChatCriativo</h1>
                <p className="text-sm text-muted-foreground">Seu assistente de IA para brainstorming</p>
              </div>
            </header>

            <ScrollArea className="flex-1 p-6">
              <div ref={scrollAreaRef} className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4 max-w-[80%]",
                      message.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg whitespace-pre-wrap",
                      message.sender === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                    )}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-4 max-w-[80%] mr-auto">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                       <Bot size={18} />
                     </div>
                     <div className="p-4 rounded-lg bg-muted rounded-bl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Pensando...</span>
                     </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  className="flex-1 h-12"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-12 w-12" disabled={isLoading}>
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatCriativo;