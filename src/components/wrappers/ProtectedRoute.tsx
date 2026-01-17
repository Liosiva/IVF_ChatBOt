import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { ReactNode } from "react";

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

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Step 1: Wait for Clerk to initialize
  if (!isUserLoaded) {
    return <LoadingSpinner />;
  }

  // Step 2: Check if user is authenticated
  if (!user) {
    return <RedirectToSignIn />;
  }

  // All checks passed - role-based access is handled by individual pages
  return <>{children}</>;
}
