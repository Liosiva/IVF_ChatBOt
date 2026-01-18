import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Chat functions for IVF Platform - sync v6

// IVF topic keywords for classification
const TOPIC_KEYWORDS: Record<string, string[]> = {
  "medications": ["medication", "drug", "pill", "injection", "hormone", "progesterone", "estrogen", "gonadotropin", "lupron", "follistim", "gonal", "menopur"],
  "procedures": ["transfer", "retrieval", "extraction", "implantation", "surgery", "procedure", "ivf cycle", "egg collection"],
  "lifestyle": ["diet", "exercise", "stress", "sleep", "alcohol", "caffeine", "smoking", "weight", "activity", "lifestyle"],
  "symptoms": ["symptom", "pain", "bloating", "cramping", "bleeding", "spotting", "side effect", "discomfort", "nausea"],
  "timeline": ["when", "how long", "duration", "schedule", "timeline", "days", "weeks", "waiting period"],
  "success_rates": ["success", "rate", "chance", "probability", "likelihood", "statistics", "outcome"],
  "emotional": ["anxiety", "stress", "worried", "scared", "emotional", "mental health", "support", "feeling", "overwhelmed"],
  "costs": ["cost", "price", "insurance", "coverage", "payment", "afford", "expensive", "financial"],
  "fertility_basics": ["ovulation", "sperm", "egg", "embryo", "fertilization", "conception", "fertility", "infertility"],
  "general": []
};

// Classify message topic
function classifyTopic(content: string): string {
  const contentLower = content.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return topic;
    }
  }
  
  return "general";
}

// Send message and get AI response
export const sendMessage = action({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Classify the topic
      const topic = classifyTopic(args.content);
      
      // Store user message
      await ctx.runMutation(api.chatSessions.addMessage, {
        sessionId: args.sessionId,
        userId: args.userId,
        role: "user",
        content: args.content,
      });
      
      // Update session title if first message
      const session = await ctx.runQuery(api.chatSessions.getSessionMessages, {
        sessionId: args.sessionId,
      });
      
      if (session.length <= 1) {
        // Set title based on first message
        const title = args.content.length > 50 
          ? args.content.substring(0, 50) + "..." 
          : args.content;
        await ctx.runMutation(api.chat.updateSessionTitle, {
          sessionId: args.sessionId,
          title: title,
        });
      }
      
      // Get relevant context using text-based search from vectorEmbeddings
      // This searches the content stored in Convex
      let relevantDocs: Array<{ content: string; source?: string }> = [];
      let sources: string[] = [];
      let context = "";
      
      try {
        relevantDocs = await ctx.runQuery(api.rag.searchByContent, {
          searchText: args.content,
          limit: 4,
        });
        
        // Build context from retrieved documents
        context = relevantDocs.map(doc => doc.content).join("\n\n");
        sources = [...new Set(relevantDocs.map(doc => doc.source).filter((s): s is string => Boolean(s)))];
      } catch (ragError) {
        console.error("RAG search error:", ragError);
        // Continue without RAG context
      }
      
      // Generate response
      let aiResponse: string;
      
      if (relevantDocs.length > 0 && context.trim().length > 0) {
        // Generate contextual response based on retrieved documents
        aiResponse = generateContextualResponse(args.content, context, topic);
      } else {
        // Fallback response when no relevant context found
        aiResponse = generateFallbackResponse(topic);
      }
      
      // Store assistant response
      const messageId = await ctx.runMutation(api.chatSessions.addMessage, {
        sessionId: args.sessionId,
        userId: args.userId,
        role: "assistant",
        content: aiResponse,
        sources: sources,
      });
      
      // Update analytics
      try {
        const today = new Date().toISOString().split('T')[0];
        await ctx.runMutation(api.analytics.updateTopicCount, {
          topic: topic,
          date: today,
        });
      } catch (analyticsError) {
        console.error("Analytics update error:", analyticsError);
        // Continue without analytics
      }
      
      return {
        messageId,
        response: aiResponse,
        sources,
        topic,
      };
    } catch (error) {
      console.error("sendMessage action error:", error);
      throw error;
    }
  },
});

// Update session title
export const updateSessionTitle = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// Generate contextual response based on retrieved documents
function generateContextualResponse(question: string, context: string, topic: string): string {
  // This is a simplified response generator
  // In production, this would call an LLM API
  
  const disclaimer = "\n\n**Important:** This information is for educational purposes only. Please consult with your fertility specialist for personalized medical advice.";
  
  if (!context || context.trim().length === 0) {
    return generateFallbackResponse(topic);
  }
  
  // Simple response based on topic
  const topicResponses: Record<string, string> = {
    "medications": `Based on the information available, here's what I found about your medication question:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "procedures": `Regarding IVF procedures:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "lifestyle": `Here's some guidance on lifestyle during IVF:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "symptoms": `About the symptoms you mentioned:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "timeline": `Here's information about IVF timelines:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "success_rates": `Regarding success rates:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "emotional": `I understand this journey can be emotionally challenging:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "costs": `Here's some information about IVF costs:\n\n${context.substring(0, 500)}...${disclaimer}`,
    "fertility_basics": `Here's what you should know:\n\n${context.substring(0, 500)}...${disclaimer}`,
  };
  
  return topicResponses[topic] || `Here's what I found:\n\n${context.substring(0, 500)}...${disclaimer}`;
}

// Fallback response when no context is found
function generateFallbackResponse(topic: string): string {
  const fallbacks: Record<string, string> = {
    "medications": "I'd be happy to help with your medication questions. For specific dosing or medication changes, please contact your fertility clinic directly as they have your complete medical history. In general, it's important to take all medications exactly as prescribed and at the same time each day.",
    "procedures": "I can provide general information about IVF procedures. Each clinic may have slightly different protocols, so please confirm specific details with your care team. Would you like me to explain any particular part of the IVF process?",
    "lifestyle": "Maintaining a healthy lifestyle during IVF can support your treatment. This generally includes balanced nutrition, moderate exercise, adequate sleep, and stress management. Your clinic may have specific recommendations based on your situation.",
    "symptoms": "Some symptoms during IVF are common, but it's always best to report any concerns to your medical team. They can determine if what you're experiencing is within normal range or requires attention.",
    "timeline": "IVF timelines vary based on individual protocols. A typical cycle takes about 4-6 weeks from start to embryo transfer. Your clinic will provide you with a personalized schedule.",
    "success_rates": "Success rates depend on many factors including age, diagnosis, and clinic protocols. Your fertility specialist can provide the most accurate expectations based on your specific situation.",
    "emotional": "The IVF journey can be emotionally challenging, and your feelings are completely valid. Many clinics offer counseling services, and support groups can also be helpful. Taking care of your mental health is an important part of this process.",
    "costs": "IVF costs vary significantly by location and clinic. I recommend contacting your clinic's financial coordinator to discuss payment options, insurance coverage, and any available programs.",
    "fertility_basics": "I'd be happy to explain fertility concepts. What specific aspect would you like to learn more about?",
    "general": "I'm here to support you through your IVF journey. Please ask me any questions about the process, and I'll do my best to provide helpful information. Remember, for medical decisions, always consult with your fertility specialist.",
  };
  
  return fallbacks[topic] || fallbacks["general"];
}

// Get chat suggestions based on topic
export const getChatSuggestions = query({
  args: {
    topic: v.optional(v.string()),
  },
  handler: async () => {
    const suggestions = [
      "What should I expect during an IVF cycle?",
      "Are there foods I should avoid during treatment?",
      "What are common side effects of IVF medications?",
      "How can I manage stress during IVF?",
      "What happens during egg retrieval?",
      "When can I take a pregnancy test after transfer?",
    ];
    return suggestions;
  },
});
