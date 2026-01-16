import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Loading...</p>
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

  // All checks passed, render protected content
  return <>{children}</>;
}
