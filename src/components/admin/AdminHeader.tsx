import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationBell from "../NotificationBell";
import { Button } from "../ui/button";

const AdminHeader = () => {
  const adminData = {
    name: "Admin",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs can go here */}
        <div></div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-input" />
          </div>
          <NotificationBell />
          <Button variant="ghost" size="icon" className="rounded-full">
            <img src={adminData.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;