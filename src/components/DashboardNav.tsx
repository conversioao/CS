import { Sparkles, Home, Grid3x3, Image, Users, CreditCard, User, Menu, X } from "lucide-react";
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
            <Link to="/credits">
              <Button className="gradient-primary text-sm">Upgrade Plan</Button>
            </Link>
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
                    <Button className="w-full gradient-primary">Upgrade Plan</Button>
                  </Link>
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
