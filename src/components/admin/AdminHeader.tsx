import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";
import NotificationBell from "../NotificationBell";

const AdminHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const adminData = {
    name: "Admin",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
  };

  return (
    <header className="sticky top-0 z-30 bg-background/30 backdrop-blur-lg border-b border-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-transparent border-0">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button variant="ghost" size="sm" className="gap-2">
              <img src={adminData.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
              <span className="text-sm hidden sm:inline">{adminData.name}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;