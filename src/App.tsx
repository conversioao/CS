import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import GenerateVideo from "./pages/GenerateVideo";
import EditImage from "./pages/EditImage";
import CombineImage from "./pages/CombineImage";
import GenerateMusic from "./pages/GenerateMusic";
import GenerateVoice from "./pages/GenerateVoice";
import Templates from "./pages/Templates";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import Gallery from "./pages/Gallery";
import Community from "./pages/Community";
import Credits from "./pages/Credits";
import Account from "./pages/Account";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminModels from "./pages/admin/AdminModels";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/admin/AdminReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/generate-video" element={<GenerateVideo />} />
          <Route path="/generate-voice" element={<GenerateVoice />} />
          <Route path="/edit-image" element={<EditImage />} />
          <Route path="/combine-image" element={<CombineImage />} />
          <Route path="/generate-music" element={<GenerateMusic />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/models" element={<Models />} />
          <Route path="/model/:slug" element={<ModelDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/community" element={<Community />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/account" element={<Account />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="models" element={<AdminModels />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;