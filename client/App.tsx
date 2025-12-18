import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Facilitators from "./pages/Facilitators";
import Retreats from "./pages/Retreats";
import Blog from "./pages/Blog";
import Contacts from "./pages/Contacts";
import FacilitatorDetail from "./pages/FacilitatorDetail";
import BlogPostDetail from "./pages/BlogPostDetail";
import RetreatDetail from "./pages/RetreatDetail";
import About from "./pages/About";
import FacilitatorApply from "./pages/FacilitatorApply";
import ScheduleEdit from "./pages/ScheduleEdit";
import TermsOfOffer from "./pages/TermsOfOffer";
import Login from "./pages/Login";
import PersonalAccount from "./pages/PersonalAccount";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="energopraktiki" element={<Facilitators />} />
                <Route path="retreats" element={<Retreats />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:postSlug" element={<BlogPostDetail />} />
                <Route path="retreats/:retreatSlug" element={<RetreatDetail />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="about" element={<About />} />
                <Route path="terms-of-offer" element={<TermsOfOffer />} />
                <Route path="facilitator-apply" element={<FacilitatorApply />} />
                <Route path="energopraktiki/:facilitatorSlug" element={<FacilitatorDetail />} />
                <Route path="schedule-edit/:code" element={<ScheduleEdit />} />
                <Route path="personal-account" element={
                  <ProtectedRoute>
                    <PersonalAccount />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
