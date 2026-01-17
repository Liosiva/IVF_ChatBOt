import { useUser, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import ChatCanvas from "@/components/chat/chat-canvas";
import SessionSidebar from "@/components/chat/session-sidebar";
import DisclaimerBanner from "@/components/chat/disclaimer-banner";
import WelcomeState from "@/components/chat/welcome-state";

// Wrapper component that catches Convex errors
function PatientChatContent() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [convexError, setConvexError] = useState(false);
  
  // Only query Convex when user is signed in and no error occurred
  let currentUser = null;
  let sessions = null;
  let messages = null;
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    currentUser = useQuery(
      api.users.getCurrentUser,
      isSignedIn && !convexError ? undefined : "skip"
    );
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sessions = useQuery(
      api.chatSessions.getUserSessions,
      currentUser?._id && !convexError ? { userId: currentUser._id } : "skip"
    );
  } catch (e: any) {
    if (e?.message?.includes("Could not find public function") && !convexError) {
      setConvexError(true);
    }
  }

  const [activeSessionId, setActiveSessionId] = useState<Id<"chatSessions"> | null>(null);

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    messages = useQuery(
      api.chatSessions.getSessionMessages,
      activeSessionId && !convexError ? { sessionId: activeSessionId } : "skip"
    );
  } catch (e: any) {
    if (e?.message?.includes("Could not find public function") && !convexError) {
      setConvexError(true);
    }
  }

  const createSession = useMutation(api.chatSessions.createSession);

  // Auto-load most recent session or create new one
  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0]._id);
    } else if (sessions && sessions.length === 0 && currentUser && !activeSessionId) {
      createSession({ userId: currentUser._id }).then((sessionId) => {
        setActiveSessionId(sessionId);
      });
    }
  }, [sessions, currentUser, activeSessionId, createSession]);

  const handleNewSession = async () => {
    if (currentUser) {
      const sessionId = await createSession({ userId: currentUser._id });
      setActiveSessionId(sessionId);
    }
  };

  const handleSelectSession = (sessionId: Id<"chatSessions">) => {
    setActiveSessionId(sessionId);
  };

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

  if (!currentUser || !sessions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your chat...</p>
        </div>
      </div>
    );
  }

  const showWelcome = sessions.length === 0 || (messages && messages.length === 0);

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[#8B9D83]/10 via-background to-[#F5F1E8]">
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          userId={currentUser._id}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />
        
        <div className="flex-1 flex flex-col">
          <DisclaimerBanner />
          
          <div className="flex-1 overflow-hidden">
            {showWelcome ? (
              <WelcomeState />
            ) : (
              <ChatCanvas
                sessionId={activeSessionId!}
                userId={currentUser._id}
                messages={messages || []}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Error boundary wrapper for PatientChat
import { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class PatientChatErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("PatientChat error caught:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-xl font-semibold mb-4">Setting Up Your Chat</h2>
              <p className="text-muted-foreground mb-4">
                The chat system is being configured. Please wait a moment and refresh the page.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PatientChat() {
  return (
    <PatientChatErrorBoundary>
      <PatientChatContent />
    </PatientChatErrorBoundary>
  );
}
