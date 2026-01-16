import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Forum from "./pages/Forum";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import CreatePost from './pages/CreatePost';
import VerifyEmail from "./pages/VerifyEmail";

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<PostDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/forum/new" element={<CreatePost />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;