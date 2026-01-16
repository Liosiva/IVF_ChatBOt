import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { Heart, MessageCircle, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI-Powered Support",
    description: "Get instant answers to your IVF questions with our intelligent chatbot",
    color: "text-[#8B9D83]"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Staff can monitor patient engagement and identify trending topics",
    color: "text-[#6B7C93]"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your conversations are encrypted and HIPAA-compliant",
    color: "text-[#3A5F5C]"
  },
  {
    icon: Heart,
    title: "Empathetic Care",
    description: "Designed with warmth and compassion for your IVF journey",
    color: "text-[#E89B8C]"
  }
] as const;

function App() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const navigate = useNavigate();

  const isAuthenticated = isUserLoaded && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F1E8] via-background to-[#8B9D83]/10">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-24">
          {/* Hero Section */}
          <div className="relative flex flex-col items-center text-center space-y-6 pb-24">
            <div className="absolute inset-x-0 -top-24 -bottom-24 bg-gradient-to-b from-background/50 via-transparent to-background/50 blur-3xl -z-10" />
            <h1 className="text-6xl font-light text-foreground tracking-tight max-w-[900px] leading-[1.1]">
              Your IVF Support Companion
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
              Access personalized guidance, expert resources, and compassionate support throughout your fertility journey.
            </p>

            {!isUserLoaded ? (
              <div className="flex gap-4 pt-4">
                <div className="h-12 px-8 w-[145px] rounded-2xl bg-muted animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center gap-5 pt-4">
                {!isAuthenticated ? (
                  <SignInButton mode="modal">
                    <Button 
                      className="h-12 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all"
                    >
                      Get Started
                    </Button>
                  </SignInButton>
                ) : (
                  <Button 
                    onClick={() => navigate("/chat")}
                    className="h-12 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all"
                  >
                    Go to Chat
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-24">
            {FEATURES.map(feature => (
              <div 
                key={feature.title} 
                className="group rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 p-8 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <feature.icon className={`h-8 w-8 mb-4 ${feature.color} transform-gpu transition-transform group-hover:scale-110`} />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="py-24">
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-16 text-center text-primary-foreground shadow-2xl">
              <h2 className="text-4xl font-light mb-4">Ready to begin?</h2>
              <p className="text-xl mb-8 opacity-90">Start your conversation with our IVF support chatbot today.</p>
              <div className="flex items-center justify-center gap-5">
                {!isAuthenticated ? (
                  <SignInButton mode="modal">
                    <Button 
                      variant="default"
                      className="h-12 px-8 text-base rounded-2xl bg-background text-foreground hover:bg-background/90 transition-all shadow-lg"
                    >
                      Get Started
                    </Button>
                  </SignInButton>
                ) : (
                  <Button 
                    onClick={() => navigate("/chat")}
                    className="h-12 px-8 text-base rounded-2xl bg-background text-foreground hover:bg-background/90 transition-all shadow-lg"
                  >
                    Go to Chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;