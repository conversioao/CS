import { Sparkles, Home, Grid3x3, Image, Users, CreditCard, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DashboardNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Dados simulados do usuário
  const userData = {
    name: "Usuário Demo",
    credits: 250,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  };

  const navLinks = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/models", icon: Grid3x3, label: "Modelos" },
    { to: "/gallery", icon: Image, label: "Galeria" },
    { to: "/community", icon: Users, label: "Comunidade" },
    { to: "/credits", icon: CreditCard, label: "Créditos" },
    { to: "/account", icon: User, label: "Conta" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold gradient-text">Conversio Studio</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full animate-custom-pulse">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">{userData.credits}</span>
              </div>
              
              <Link to="/account">
                <Button variant="ghost" size="sm" className="gap-2 hover-lift">
                  <img src={userData.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{userData.name.split(' ')[0]}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="gradient-text">Menu</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                  <Link to="/credits" onClick={() => setIsOpen(false)} className="mt-4">
                    <Button className="w-full gradient-primary">Comprar Créditos</Button>
                  </Link>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <img src={userData.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{userData.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CreditCard className="w-3 h-3" />
                          {userData.credits} créditos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
