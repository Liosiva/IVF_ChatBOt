import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import ChatCanvas from "@/components/chat/chat-canvas";
import SessionSidebar from "@/components/chat/session-sidebar";
import DisclaimerBanner from "@/components/chat/disclaimer-banner";
import WelcomeState from "@/components/chat/welcome-state";

export default function PatientChat() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const sessions = useQuery(
    api.chatSessions.getUserSessions,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const [activeSessionId, setActiveSessionId] = useState<Id<"chatSessions"> | null>(null);

  const messages = useQuery(
    api.chatSessions.getSessionMessages,
    activeSessionId ? { sessionId: activeSessionId } : "skip"
  );

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
