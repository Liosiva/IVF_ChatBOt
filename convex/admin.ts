import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin functions for IVF Platform - sync v6

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();
    return users;
  },
});

export const getUsersByRole = query({
  args: {
    role: v.union(v.literal("patient"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return users;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("patient"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
    });
    
    // Log activity
    await ctx.db.insert("activityLogs", {
      userId: args.userId,
      action: "role_change",
      details: `Role changed to ${args.role}`,
      targetType: "user",
      targetId: args.userId,
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const toggleUserStatus = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
    });
    
    // Log activity
    await ctx.db.insert("activityLogs", {
      userId: args.userId,
      action: args.isActive ? "user_activated" : "user_deactivated",
      details: args.isActive ? "User account activated" : "User account deactivated",
      targetType: "user",
      targetId: args.userId,
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const createStaffAccount = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user with email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      // Update existing user to staff role
      await ctx.db.patch(existing._id, {
        role: "staff",
        name: args.name,
      });
      return existing._id;
    }
    
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      tokenIdentifier: args.tokenIdentifier,
      role: "staff",
      isActive: true,
      createdAt: Date.now(),
    });
    
    // Log activity
    await ctx.db.insert("activityLogs", {
      userId: userId,
      action: "staff_created",
      details: `Staff account created for ${args.email}`,
      targetType: "user",
      targetId: userId,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});

export const createAdminAccount = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        role: "admin",
        name: args.name,
      });
      return existing._id;
    }
    
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      tokenIdentifier: args.tokenIdentifier,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});

export const getAllChatHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const messages = await ctx.db
      .query("chatMessages")
      .order("desc")
      .take(limit);
    return messages;
  },
});

export const getChatHistoryByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_created")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .collect();
    return messages;
  },
});

export const searchChatHistory = query({
  args: {
    keyword: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .collect();
    
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(args.keyword.toLowerCase())
    );
  },
});

export const getChatSessionWithMessages = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
    
    const user = await ctx.db.get(session.userId);
    
    return {
      session,
      messages,
      user,
    };
  },
});

export const getActivityLogs = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    
    let query = ctx.db.query("activityLogs");
    
    if (args.action) {
      query = query.withIndex("by_action", (q) => q.eq("action", args.action));
    } else {
      query = query.withIndex("by_created");
    }
    
    const logs = await query.order("desc").take(limit);
    
    // Get user details for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return { ...log, userName: user?.name || user?.email || "Unknown" };
      })
    );
    
    return logsWithUsers;
  },
});

export const getSystemStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const sessions = await ctx.db.query("chatSessions").collect();
    const messages = await ctx.db.query("chatMessages").collect();
    const embeddings = await ctx.db.query("vectorEmbeddings").collect();
    
    const patientCount = users.filter(u => u.role === "patient" || !u.role).length;
    const staffCount = users.filter(u => u.role === "staff").length;
    const adminCount = users.filter(u => u.role === "admin").length;
    
    // Get messages from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMessages = messages.filter(m => m.createdAt > sevenDaysAgo);
    
    return {
      totalUsers: users.length,
      patientCount,
      staffCount,
      adminCount,
      totalSessions: sessions.length,
      totalMessages: messages.length,
      messagesLast7Days: recentMessages.length,
      vectorEmbeddings: embeddings.length,
    };
  },
});

export const exportChatData = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    format: v.optional(v.union(v.literal("json"), v.literal("csv"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("chatMessages").withIndex("by_created");
    
    const messages = await query.collect();
    
    let filteredMessages = messages;
    if (args.startDate) {
      filteredMessages = filteredMessages.filter(m => m.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      filteredMessages = filteredMessages.filter(m => m.createdAt <= args.endDate!);
    }
    
    // Get session and user data for each message
    const enrichedMessages = await Promise.all(
      filteredMessages.map(async (msg) => {
        const session = await ctx.db.get(msg.sessionId);
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          sessionTitle: session?.title,
          userName: user?.name || user?.email,
          userRole: user?.role,
        };
      })
    );
    
    return enrichedMessages;
  },
});
