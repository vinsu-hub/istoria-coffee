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
import LoginPage from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";

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
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminLayout} />
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
