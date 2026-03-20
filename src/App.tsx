import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnitProvider } from "@/lib/contexts/unit-context";
import { useLocation } from "@/hooks/use-location";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Historical from "@/pages/historical";
import { Navbar } from "@/components/layout/navbar";

const queryClient = new QueryClient();

// A wrapper to provide location data to the layout and sub-routes
function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar location={location} />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/historical" component={Historical} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnitProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </UnitProvider>
    </QueryClientProvider>
  );
}

export default App;
