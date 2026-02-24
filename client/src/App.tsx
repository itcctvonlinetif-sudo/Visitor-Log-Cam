import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";

// Pages
import Dashboard from "@/pages/Dashboard";
import AddVisitor from "@/pages/AddVisitor";
import ScanRFID from "@/pages/ScanRFID";
import ScanQR from "@/pages/ScanQR";
import ExportImport from "@/pages/ExportImport";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={AddVisitor} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/scan-rfid" component={ScanRFID} />
          <Route path="/scan-qr" component={ScanQR} />
          <Route path="/export" component={ExportImport} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
