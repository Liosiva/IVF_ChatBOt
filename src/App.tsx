import { Suspense, useEffect } from "react";
import { Route, Routes, useRoutes, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import routes from "tempo-routes";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import PatientChat from "./pages/patient/chat";
import StaffDashboard from "./pages/staff/dashboard";
import AdminConsole from "./pages/admin/console";
import { Toaster } from "@/components/ui/sonner";

function TempoRoutes() {
  return import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;
}

function App() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  const currentUser = useQuery(
    api.users.getCurrentUser
  );
  
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  // Create or update user on login
  useEffect(() => {
    if (isLoaded && user) {
      createOrUpdateUser().catch(console.error);
    }
  }, [isLoaded, user, createOrUpdateUser]);

  // Role-based redirect on login
  useEffect(() => {
    if (currentUser && window.location.pathname === "/") {
      switch (currentUser.role) {
        case "patient":
          navigate("/chat");
          break;
        case "staff":
          navigate("/staff");
          break;
        case "admin":
          navigate("/admin");
          break;
      }
    }
  }, [currentUser, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<PatientChat />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminConsole />} />
        </Routes>
        <TempoRoutes />
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
