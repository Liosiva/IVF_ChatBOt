import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"patient" | "staff" | "admin">;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Step 1: Wait for Clerk to initialize
  if (!isUserLoaded) {
    return <LoadingSpinner />;
  }

  // Step 2: Check if user is authenticated
  if (!user) {
    return <RedirectToSignIn />;
  }

  // Step 3: Wait for Convex user data
  if (currentUser === undefined) {
    return <LoadingSpinner />;
  }

  // Step 4: Check if user exists in database
  if (currentUser === null) {
    return <Navigate to="/" replace />;
  }

  // Step 5: Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role || "patient";
    if (!allowedRoles.includes(userRole as "patient" | "staff" | "admin")) {
      // Redirect to appropriate page based on role
      switch (userRole) {
        case "patient":
          return <Navigate to="/chat" replace />;
        case "staff":
          return <Navigate to="/staff" replace />;
        case "admin":
          return <Navigate to="/admin" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  // All checks passed, render protected content
  return <>{children}</>;
}
