import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, Image, Users, CreditCard, User, ChevronLeft, ChevronRight, DollarSign, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";

const navLinks = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/models", icon: Grid3x3, label: "Modelos" },
  { to: "/gallery", icon: Image, label: "Galeria" },
  { to: "/credits", icon: CreditCard, label: "Créditos" },
  { to: "/statistics", icon: TrendingUp, label: "Estatísticas" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { profile } = useSession();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="h-full p-4">
      <aside
        className={cn(
          "relative h-full bg-card/50 backdrop-blur-xl border border-border/20 flex flex-col transition-all duration-300 ease-in-out rounded-2xl shadow-2xl shadow-primary/5",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="flex items-center justify-center h-24 p-4">
          <Link to="/">
            <img src={logo} alt="Conversio Studio" className={cn("transition-all duration-300", isCollapsed ? "h-10" : "h-12")} />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname + location.search === link.to || (link.to === "/dashboard" && location.pathname === "/");
            return (
              <Tooltip key={link.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.to}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group relative",
                      "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                      isActive && "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.label}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" align="center">
                    <p>{link.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
          {profile?.account_type === 'affiliate' && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to="/affiliate/dashboard"
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group relative",
                    "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                    location.pathname === "/affiliate/dashboard" && "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                  )}
                >
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">Afiliado</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" align="center">
                  <p>Afiliado</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </nav>

        <div className="px-3 py-6 mt-auto">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/account"
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 group",
                  "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                  location.pathname === "/account" && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <User className="w-5 h-5 flex-shrink-0" />
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
          className="absolute -right-4 top-20 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </div>
  );
};

export default DashboardSidebar;