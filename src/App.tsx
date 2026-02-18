import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Francais = lazy(() => import("./pages/Francais"));
const Mathematiques = lazy(() => import("./pages/Mathematiques"));
const Concentration = lazy(() => import("./pages/Concentration"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

import { UserProvider, useUser } from "@/contexts/UserContext";
import LoginScreen from "@/components/auth/LoginScreen";

const AppRoutes = () => {
  const { user, isLoading, updateLastPath, progress } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Track last path
  useEffect(() => {
    if (user && !isLoading) {
      updateLastPath(location.pathname);
    }
  }, [location, user, isLoading, updateLastPath]);

  // Restore session on login/load
  useEffect(() => {
    if (user && !isLoading && progress.lastPath && location.pathname === '/') {
      if (progress.lastPath !== '/') {
        navigate(progress.lastPath);
      }
    }
  }, [user, isLoading, progress.lastPath, location.pathname, navigate]);

  if (isLoading) return null;
  if (!user) return <LoginScreen />;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-400 font-medium">
        Chargement...
      </div>
    }>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/francais" element={<Francais />} />
        <Route path="/mathematiques" element={<Mathematiques />} />
        <Route path="/concentration" element={<Concentration />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
