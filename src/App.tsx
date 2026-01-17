import { Suspense, useEffect, Component, ReactNode } from "react";
import { Route, Routes, useRoutes } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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

// Error boundary to catch Convex errors gracefully
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ConvexErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Log but don't crash for Convex deployment issues
    console.warn("Convex error caught:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.props.children;
    }
    return this.props.children;
  }
}

function AppContent() {
  return (
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
  );
}

function App() {
  const { isLoaded } = useUser();

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
    <ConvexErrorBoundary
      fallback={
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <AppContent />
        </Suspense>
      }
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <AppContent />
      </Suspense>
    </ConvexErrorBoundary>
  );
}

export default App;
