import { CreditCard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DashboardSidebar from "./DashboardSidebar"; // We can reuse the links logic if needed

const DashboardHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const userData = {
    name: "Usuário Demo",
    credits: 250,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  };

  const navLinks = [
    { to: "/dashboard", label: "Home" },
    { to: "/models", label: "Modelos" },
    { to: "/gallery", label: "Galeria" },
    { to: "/community", label: "Comunidade" },
    { to: "/credits", label: "Créditos" },
    { to: "/account", label: "Conta" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background/30 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <DashboardSidebar />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex-1" />

          {/* User Info and Actions */}
          <div className="flex items-center gap-3">
            <div id="dashboard-nav-credits" className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{userData.credits}</span>
            </div>
            
            <Link to="/account" id="dashboard-nav-account">
              <Button variant="ghost" size="sm" className="gap-2">
                <img src={userData.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                <span className="text-sm hidden sm:inline">{userData.name.split(' ')[0]}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;