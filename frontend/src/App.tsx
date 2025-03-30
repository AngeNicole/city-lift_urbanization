import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import FindTransport from "./pages/FindTransport";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import ListVehicles from "./pages/vehicles";
import RegisterVehicle from "./pages/vehicles/register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Rides from "./pages/Rides";
import AllUsers from "./pages/users";
import ActivateVehicle from "./pages/vehicles/activate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/users" element={<AllUsers />} />
              <Route path="/find" element={<FindTransport />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/vehicles" element={<ListVehicles />} />
              <Route path="/activate-vehicle" element={<ActivateVehicle />} />
              <Route path="/add-vehicle" element={<RegisterVehicle />} />
            </Route>

            {/* Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
