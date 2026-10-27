import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ServerWakeNotice from "@/components/ServerWakeNotice";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Forum from "./pages/Forum";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* Must sit inside AuthProvider: it needs to know who is logged in */}
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ServerWakeNotice />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/new" element={<CreatePost />} />
              <Route path="/forum/:id" element={<PostDetail />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;