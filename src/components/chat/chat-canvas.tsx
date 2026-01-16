import { useState, useRef, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  _id: Id<"chatMessages">;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  createdAt: number;
}

interface ChatCanvasProps {
  sessionId: Id<"chatSessions">;
  userId: Id<"users">;
  messages: Message[];
}

export default function ChatCanvas({ sessionId, userId, messages }: ChatCanvasProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = useAction(api.chat.sendMessage);
  const addMessage = useMutation(api.chatSessions.addMessage);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Send message using the action (handles both user and assistant messages)
      await sendMessage({
        sessionId,
        userId,
        content: userMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback: add user message directly and show error
      await addMessage({
        sessionId,
        userId,
        role: "user",
        content: userMessage,
      });
      await addMessage({
        sessionId,
        userId,
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[720px] mx-auto px-12 py-8">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`mb-6 ${
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-md ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border/50"
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Sources:
                    </p>
                    <ul className="text-xs space-y-1">
                      {message.sources.map((source, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-6"
          >
            <div className="bg-card rounded-2xl px-6 py-4 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.span
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your IVF journey..."
            className="min-h-[80px] resize-none bg-card border-border/50 focus:border-primary transition-colors"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!input.trim() || isLoading}
            className="h-[80px] px-6 bg-primary hover:bg-primary/90 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
