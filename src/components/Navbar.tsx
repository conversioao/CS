import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Conversio Studio" className="h-10 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#modelos" className="text-muted-foreground hover:text-foreground transition-colors">
              Modelos
            </a>
            <a href="#galeria" className="text-muted-foreground hover:text-foreground transition-colors">
              Galeria
            </a>
            <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;