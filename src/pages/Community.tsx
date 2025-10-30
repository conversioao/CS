import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Sparkles, Trophy, TrendingUp, Users, Award } from "lucide-react";
import { useState } from "react";

const posts = [
  {
    image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&h=600&fit=crop",
    title: "Uma moça negra sentada no céu",
    author: "Maria Silva",
    time: "Há 2 horas",
    likes: 1250,
    comments: 24,
    trending: true
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop",
    title: "Retrato profissional estilo editorial",
    author: "João Santos",
    time: "Há 5 horas",
    likes: 890,
    comments: 18
  },
  {
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&fit=crop",
    title: "Mulher com cabelo cacheado em fundo roxo",
    author: "Ana Costa",
    time: "Há 8 horas",
    likes: 1580,
    comments: 32,
    trending: true
  },
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    title: "Homem atlético em cenário urbano",
    author: "Pedro Lima",
    time: "Há 12 horas",
    likes: 0,
    comments: 0
  },
  {
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop",
    title: "Retrato masculino com luz natural",
    author: "Lucas Oliveira",
    time: "Há 1 dia",
    likes: 1120,
    comments: 27
  },
  {
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop",
    title: "Foto profissional para perfil",
    author: "Carla Mendes",
    time: "Há 1 dia",
    likes: 2340,
    comments: 41
  },
];

const challenges = [
  {
    title: "Desafio Semanal",
    description: "Crie uma imagem usando o modelo FashionFit",
    reward: "500 créditos",
    participants: 234,
    endsIn: "3 dias",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Trending Creator",
    description: "Consiga 1000 curtidas em suas criações",
    reward: "1000 créditos",
    participants: 156,
    endsIn: "7 dias",
    icon: TrendingUp,
    color: "from-pink-500 to-purple-500"
  },
  {
    title: "Colaboração",
    description: "Compartilhe e comente em 10 posts",
    reward: "300 créditos",
    participants: 567,
    endsIn: "5 dias",
    icon: Users,
    color: "from-blue-500 to-cyan-500"
  },
];

const topCreators = [
  { name: "Ana Silva", points: 15420, rank: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana" },
  { name: "João Pedro", points: 12890, rank: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao" },
  { name: "Maria Costa", points: 11340, rank: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria" },
  { name: "Pedro Santos", points: 9876, rank: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro" },
  { name: "Sofia Lima", points: 8654, rank: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia" },
];

const Community = () => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const handleLike = (index: number) => {
    setLikedPosts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
              Comunidade Conversio
            </h1>
            <p className="text-muted-foreground text-lg">
              Compartilhe, inspire-se e ganhe recompensas
            </p>
          </div>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 hover:border-primary/50 transition-all duration-300"
                >
                  {post.trending && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 z-10">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Em Alta
                    </Badge>
                  )}
                  <div className="relative aspect-square overflow-hidden">
                    {post.likes > 0 && (
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-sm font-semibold">{post.likes}</span>
                      </div>
                    )}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>por {post.author}</span>
                      <span>{post.time}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(index)}
                        className={`flex items-center gap-2 transition-colors ${
                          likedPosts.includes(index) 
                            ? 'text-primary' 
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts.includes(index) ? 'fill-primary' : ''}`} />
                        <span className="text-sm">{post.likes > 0 ? post.likes : ''}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments > 0 ? post.comments : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg">
                Carregar Mais
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge, index) => {
                const Icon = challenge.icon;
                return (
                  <div
                    key={index}
                    className="bg-secondary/20 border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {challenge.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recompensa:</span>
                        <Badge className="bg-primary">{challenge.reward}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Participantes:</span>
                        <span className="font-semibold">{challenge.participants}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Termina em:</span>
                        <span className="font-semibold">{challenge.endsIn}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full gradient-primary">
                      Participar
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            <div className="bg-secondary/20 border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Top Criadores do Mês</h2>
              </div>
              
              <div className="space-y-4">
                {topCreators.map((creator, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      creator.rank <= 3 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div className="relative">
                      <div className={`text-2xl font-bold ${
                        creator.rank === 1 ? 'text-yellow-500' :
                        creator.rank === 2 ? 'text-gray-400' :
                        creator.rank === 3 ? 'text-orange-600' :
                        'text-muted-foreground'
                      }`}>
                        #{creator.rank}
                      </div>
                    </div>
                    
                    <img 
                      src={creator.avatar} 
                      alt={creator.name}
                      className="w-12 h-12 rounded-full border-2 border-primary"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{creator.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {creator.points.toLocaleString('pt-BR')} pontos
                      </p>
                    </div>
                    
                    {creator.rank <= 3 && (
                      <Badge className={
                        creator.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        creator.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        'bg-gradient-to-r from-orange-600 to-orange-800'
                      }>
                        {creator.rank === 1 ? '🏆' : creator.rank === 2 ? '🥈' : '🥉'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
