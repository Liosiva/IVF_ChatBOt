import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/../convex/_generated/api";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  
  const currentUser = useQuery(
    api.users.getUserByToken,
    user ? { tokenIdentifier: user.id } : "skip"
  );
  
  useEffect(() => {
    if (user) {
      createOrUpdateUser();
    }
  }, [user, createOrUpdateUser]);

  const getNavLink = () => {
    if (!currentUser) return "/";
    switch (currentUser.role) {
      case "patient":
        return "/chat";
      case "staff":
        return "/staff";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <nav className="sticky top-0 w-full bg-card/80 backdrop-blur-xl border-b border-border/50 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-light text-foreground">IVF Support</span>
          </Link>

          <div className="flex-1"></div>

          {isLoaded ? (
            <div className="flex items-center gap-4">
              <Authenticated>
                <div className="hidden md:flex items-center gap-3">
                  {currentUser && (
                    <Link
                      to={getNavLink()}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-2xl transition-colors duration-200"
                    >
                      {currentUser.role === "patient" && "My Chat"}
                      {currentUser.role === "staff" && "Analytics"}
                      {currentUser.role === "admin" && "Admin Console"}
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal" signUpFallbackRedirectUrl="/">
                  <Button
                    variant="default"
                    className="h-10 px-6 text-sm rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </Unauthenticated>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
