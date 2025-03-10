import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreatePuzzle from "./pages/CreatePuzzle";
import SharePuzzle from "./pages/SharePuzzle";
import SolvePuzzle from "./pages/SolvePuzzle";
import NotFound from "./pages/NotFound";
import FloatingHearts from "./components/FloatingHearts";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingHearts count={12} />
        
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreatePuzzle />} />
          <Route path="/share/:puzzleSlug" element={<SharePuzzle />} />
          <Route path="/solve" element={<SolvePuzzle />} />
          <Route path="/solve/:puzzleSlug" element={<SolvePuzzle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
