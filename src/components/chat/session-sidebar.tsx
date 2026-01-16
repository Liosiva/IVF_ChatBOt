import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Session {
  _id: Id<"chatSessions">;
  title?: string;
  createdAt: number;
  updatedAt: number;
}

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: Id<"chatSessions"> | null;
  userId: Id<"users">;
  onSelectSession: (sessionId: Id<"chatSessions">) => void;
  onNewSession: () => void;
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  userId,
  onSelectSession,
  onNewSession,
}: SessionSidebarProps) {
  const clearHistory = useMutation(api.chatSessions.clearUserHistory);
  const deleteSession = useMutation(api.chatSessions.deleteSession);

  const handleClearHistory = async () => {
    try {
      await clearHistory({ userId });
      toast.success("Chat history cleared successfully");
    } catch (error) {
      toast.error("Failed to clear history");
      console.error(error);
    }
  };

  const handleDeleteSession = async (sessionId: Id<"chatSessions">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession({ sessionId });
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
      console.error(error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-[280px] bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col">
      <div className="p-6 border-b border-border/50">
        <Button
          onClick={onNewSession}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <motion.button
              key={session._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectSession(session._id)}
              className={`w-full text-left p-4 rounded-xl transition-all group relative ${
                activeSessionId === session._id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title || "Untitled Chat"}
                  </p>
                  <p className="text-xs opacity-70 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session._id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border/50">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Chat History?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your chat
                sessions and messages.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleClearHistory();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
