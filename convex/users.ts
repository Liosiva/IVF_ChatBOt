import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// User management functions for IVF Patient Support Chatbot
// Sync trigger: force-deploy-v4

export const getUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (user !== null) {
      return {
        ...user,
        role: user.role || "patient",
        isActive: user.isActive ?? true,
      };
    }

    return null;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (user !== null) {
      return {
        ...user,
        role: user.role || "patient",
        isActive: user.isActive ?? true,
      };
    }

    return null;
  },
});

export const createOrUpdateUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (existingUser) {
      const updates: Record<string, unknown> = {};
      if (existingUser.name !== identity.name) updates.name = identity.name;
      if (existingUser.email !== identity.email) updates.email = identity.email;
      if (!existingUser.role) updates.role = "patient";
      if (!existingUser.createdAt) updates.createdAt = Date.now();
      if (existingUser.isActive === undefined) updates.isActive = true;
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }
      return {
        ...existingUser,
        ...updates,
        role: existingUser.role || "patient",
      };
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
      role: "patient",
      isActive: true,
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return await ctx.db.get(user._id);
  },
});