import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      tokenIdentifier: args.tokenIdentifier,
      role: "staff",
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
    
    // Simple keyword search (in production, use full-text search)
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(args.keyword.toLowerCase())
    );
  },
});
