import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CreditCard, Image, Video } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardStats = () => {
  const stats = {
    credits: 250,
    maxCredits: 500,
    imagesCreated: 142,
    videosCreated: 23,
  };

  const creditUsage = (stats.credits / stats.maxCredits) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Visão Geral</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Créditos Restantes</span>
            <span className="font-bold text-lg">{stats.credits} / {stats.maxCredits}</span>
          </div>
          <Progress value={creditUsage} className="h-2" />
          <Link to="/credits">
            <Button variant="outline" size="sm" className="w-full mt-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Comprar Mais Créditos
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-primary/10 p-4 rounded-lg">
            <Image className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.imagesCreated}</p>
            <p className="text-xs text-muted-foreground">Imagens Criadas</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg">
            <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.videosCreated}</p>
            <p className="text-xs text-muted-foreground">Vídeos Criados</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;