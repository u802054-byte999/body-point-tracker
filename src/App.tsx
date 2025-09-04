import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PatientList from "./pages/PatientList";
import AddPatient from "./pages/AddPatient";
import EditPatient from "./pages/EditPatient";
import EditSession from "./pages/EditSession";
import AcupointSelection from "./pages/AcupointSelection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patient/new" element={<AddPatient />} />
          <Route path="/patient/:patientId/edit" element={<EditPatient />} />
          <Route path="/patient/:patientId/treatment" element={<Index />} />
          <Route path="/patient/:patientId/treatment/acupoints" element={<AcupointSelection />} />
          <Route path="/patient/:patientId/treatment/edit/:sessionId" element={<EditSession />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
