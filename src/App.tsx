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
import Templates from "./pages/Templates";
import Models from "./pages/Models";
import Gallery from "./pages/Gallery";
import Community from "./pages/Community";
import Credits from "./pages/Credits";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/generate-video" element={<GenerateVideo />} />
          <Route path="/edit-image" element={<EditImage />} />
          <Route path="/combine-image" element={<CombineImage />} />
          <Route path="/generate-music" element={<GenerateMusic />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/models" element={<Models />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/community" element={<Community />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/account" element={<Account />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
