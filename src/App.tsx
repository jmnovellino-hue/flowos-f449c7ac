// FlowOS - H2H Inner Lab Application
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BetaLanding from "./pages/BetaLanding";
import BetaLaunch from "./pages/BetaLaunch";
import BetaAdmin from "./pages/BetaAdmin";
import DownloadSpecs from "./pages/DownloadSpecs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/beta" element={<BetaLanding />} />
            <Route path="/beta/launch" element={<BetaLaunch />} />
            <Route path="/beta/admin" element={<BetaAdmin />} />
            <Route path="/download-specs" element={<DownloadSpecs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
