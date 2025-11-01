import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, Image, Users, CreditCard, User, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/models", icon: Grid3x3, label: "Modelos" },
  { to: "/gallery", icon: Image, label: "Galeria" },
  { to: "/community", icon: Users, label: "Comunidade" },
  { to: "/chat-criativo", icon: Bot, label: "ChatCriativo", premium: true },
  { to: "/credits", icon: CreditCard, label: "Créditos" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={cn(
        "relative h-screen bg-card/30 backdrop-blur-xl border-r border-border/20 flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-center h-20 p-4">
        <Link to="/">
          <img src={logo} alt="Conversio Studio" className={cn("transition-all duration-300", isCollapsed ? "h-8" : "h-10")} />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Tooltip key={link.to}>
              <TooltipTrigger asChild>
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group relative",
                    "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                    isActive && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                  {link.premium && !isCollapsed && (
                     <span className="absolute right-3 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">PRO</span>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" align="center">
                  <p>{link.label} {link.premium && '(PRO)'}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      <div className="px-4 py-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/account"
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 group",
                "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                location.pathname === "/account" && "bg-primary/10 text-primary font-semibold"
              )}
            >
              <User className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span className="truncate">Conta</span>}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" align="center">
              <p>Conta</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default DashboardSidebar;