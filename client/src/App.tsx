import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MenuPage from "./pages/Menu";
import BoardPage from "./pages/Board";
import OrderPage from "./pages/Order";
import ContactPage from "./pages/Contact";
import CommunityPage from "./pages/Community";

// Lazy-loaded: these are the only pages that touch client/src/lib/supabase.ts.
// Code-splitting them means a bad/missing Supabase env var (or any bug in the
// admin surface) can only break /login and /admin, never the whole site —
// this is what actually happened once already (see SESSION_HANDOFF context).
const LoginPage = lazy(() => import("./pages/Login"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/board" component={BoardPage} />
      <Route path="/order" component={OrderPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/community" component={CommunityPage} />
      {/* Intentionally not linked from Nav.tsx — see plan's admin-panel notes */}
      <Route path="/login">
        <Suspense fallback={null}>
          <LoginPage />
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={null}>
          <AdminLayout />
        </Suspense>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
