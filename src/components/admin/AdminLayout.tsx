import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;