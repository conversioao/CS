import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Settings, Bot, FileText } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Usuários" },
  { to: "/admin/payments", icon: CreditCard, label: "Pagamentos" },
  { to: "/admin/models", icon: Bot, label: "Modelos e Custos" },
  { to: "/admin/reports", icon: FileText, label: "Relatórios" },
  { to: "/admin/settings", icon: Settings, label: "Configurações" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="h-full p-4">
      <aside className="relative h-full bg-card/50 backdrop-blur-xl border border-border/20 flex flex-col w-64 rounded-2xl shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-center h-24 p-4">
          <Link to="/admin">
            <img src={logo} alt="Conversio Studio Admin" className="h-12" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group relative",
                  "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                  isActive && "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-3 py-6 mt-auto">
           <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 group",
                  "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                )}
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Painel do Usuário</span>
              </Link>
        </div>
      </aside>
    </div>
  );
};

export default AdminSidebar;