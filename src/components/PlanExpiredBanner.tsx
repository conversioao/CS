import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";

const PlanExpiredBanner = () => {
  return (
    <Card className="bg-yellow-500/10 border-yellow-500/30 p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Info className="w-8 h-8 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold">Seu plano gratuito terminou</h3>
          <p className="text-sm text-muted-foreground">
            Para continuar a gerar conteúdo, por favor, compre um dos nossos pacotes de créditos.
          </p>
        </div>
        <Link to="/credits" className="w-full sm:w-auto">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full">
            Ver Planos
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default PlanExpiredBanner;