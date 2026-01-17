import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Chat session functions for IVF Platform - sync v6

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("chatSessions", {
      userId: args.userId,
      title: args.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return sessionId;
  },
});

export const getUserSessions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return sessions;
  },
});

export const getSessionMessages = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
    return messages;
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    sources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      sources: args.sources,
      createdAt: Date.now(),
    });

    // Update session timestamp
    await ctx.db.patch(args.sessionId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

export const clearUserHistory = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all sessions for user
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Delete all messages for each session
    for (const session of sessions) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete session
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

export const deleteSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    // Delete all messages in session
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete session
    await ctx.db.delete(args.sessionId);

    return { success: true };
  },
});
