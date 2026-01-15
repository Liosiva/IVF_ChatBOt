import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, HelpCircle, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeState() {
  const sampleQuestions = [
    {
      icon: Calendar,
      question: "What should I expect during my first IVF consultation?",
      color: "text-[#8B9D83]",
    },
    {
      icon: Heart,
      question: "How can I prepare my body for IVF treatment?",
      color: "text-[#6B7C93]",
    },
    {
      icon: HelpCircle,
      question: "What are the success rates for IVF?",
      color: "text-[#E89B8C]",
    },
    {
      icon: MessageCircle,
      question: "What medications are typically used in IVF?",
      color: "text-[#3A5F5C]",
    },
  ];

  return (
    <div className="flex items-center justify-center h-full p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-5xl font-light text-foreground mb-4">
            Welcome to Your IVF Support
          </h2>
          <p className="text-lg text-muted-foreground">
            Ask me anything about your IVF journey. I'm here to provide guidance and support.
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Getting Started</CardTitle>
            <CardDescription className="text-base">
              Start a conversation by typing your question below, or explore these common topics:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleQuestions.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-left p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.question}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Be specific with your questions to get the most helpful responses.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
