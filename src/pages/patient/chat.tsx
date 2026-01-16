import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import DisclaimerBanner from "@/components/chat/disclaimer-banner";
import WelcomeState from "@/components/chat/welcome-state";

export default function PatientChat() {
  const { user, isLoaded } = useUser();

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

  if (!user) {
    return <RedirectToSignIn />;
  }

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[#8B9D83]/10 via-background to-[#F5F1E8]">
        <div className="flex-1 flex flex-col">
          <DisclaimerBanner />
          
          <div className="flex-1 overflow-hidden">
            <WelcomeState />
          </div>
        </div>
      </div>
    </>
  );
}
