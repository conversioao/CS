import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Settings, Bot, FileText, MessageSquare, Package } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", section: "MENU" },
  { to: "/admin/users", icon: Users, label: "Usuários", section: "MENU" },
  { to: "/admin/payments", icon: CreditCard, label: "Pagamentos", section: "MENU" },
  { to: "/admin/whatsapp", icon: MessageSquare, label: "WhatsApp", section: "MENU" },
];

const productLinks = [
  { to: "/admin/credit-packages", icon: Package, label: "Pacotes" },
  { to: "/admin/models", icon: Bot, label: "Modelos e Custos" },
];

const otherLinks = [
  { to: "/admin/reports", icon: FileText, label: "Relatórios" },
  { to: "/admin/settings", icon: Settings, label: "Configurações" },
];

const AdminSidebar = () => {
  const location = useLocation();

  const renderLink = (link: any) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.to;
    return (
      <Link
        key={link.to}
        to={link.to}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <aside className="h-screen sticky top-0 bg-card flex flex-col w-64 border-r border-border">
      <div className="flex items-center justify-center h-20 border-b border-border">
        <Link to="/admin">
          <img src={logo} alt="Conversio Studio Admin" className="h-10" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6">
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Menu</h3>
          <div className="space-y-1">
            {navLinks.map(renderLink)}
          </div>
        </div>
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Produto</h3>
          <div className="space-y-1">
            {productLinks.map(renderLink)}
          </div>
        </div>
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Outros</h3>
          <div className="space-y-1">
            {otherLinks.map(renderLink)}
          </div>
        </div>
      </nav>
      
      <div className="px-4 py-6 mt-auto border-t border-border">
         <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Painel do Usuário</span>
            </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;