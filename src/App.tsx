import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import About from "./pages/About";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Cookies from "./pages/legal/Cookies";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import FAQ from "./pages/Faq";
import Help from "./pages/Help";
import MemberDashboard from "./pages/member/Dashboard";
import MemberServicesPage from "./pages/member/Services";
import MemberBookings from "./pages/member/Bookings";
import MemberBilling from "./pages/member/Billing";
import MemberSettings from "./pages/member/Settings";
import MemberOnboarding from "./pages/member/Onboarding";
import OnboardingAddons from "./pages/member/OnboardingAddons";
import CheckoutSuccess from "./pages/member/CheckoutSuccess";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminServices from "./pages/admin/Services";
import AdminOrders from "./pages/admin/Orders";
import AdminWebsiteBuilds from "./pages/admin/WebsiteBuilds";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />

          {/* Protected Member Routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute requireSubscription>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/onboarding"
            element={
              <ProtectedRoute onlyWithoutSubscription>
                <MemberOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/onboarding/addons"
            element={
              <ProtectedRoute onlyWithoutSubscription>
                <OnboardingAddons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/services"
            element={
              <ProtectedRoute requireSubscription>
                <MemberServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/bookings"
            element={
              <ProtectedRoute requireSubscription>
                <MemberBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/billing"
            element={
              <ProtectedRoute requireSubscription>
                <MemberBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/settings"
            element={
              <ProtectedRoute requireSubscription>
                <MemberSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AdminProtectedRoute>
                <AdminMembers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <AdminProtectedRoute>
                <AdminServices />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/website-builds"
            element={
              <AdminProtectedRoute>
                <AdminWebsiteBuilds />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute>
                <AdminSettings />
              </AdminProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
