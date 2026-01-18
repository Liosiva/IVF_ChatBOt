import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// User management functions for IVF Patient Support Chatbot
// Sync trigger: force-deploy-v6

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
      console.log("getCurrentUser: No identity found");
      return null;
    }

    console.log("getCurrentUser: Looking up user with token:", identity.subject);

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (user !== null) {
      console.log("getCurrentUser: Found user:", user._id);
      return {
        ...user,
        role: user.role || "patient",
        isActive: user.isActive ?? true,
      };
    }

    console.log("getCurrentUser: User not found in database");
    return null;
  },
});

export const createOrUpdateUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      console.log("createOrUpdateUser: No identity found - user not authenticated");
      return null;
    }

    console.log("createOrUpdateUser: Processing user with subject:", identity.subject);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (existingUser) {
      console.log("createOrUpdateUser: Found existing user:", existingUser._id);
      const updates: Record<string, unknown> = {};
      if (existingUser.name !== identity.name) updates.name = identity.name;
      if (existingUser.email !== identity.email) updates.email = identity.email;
      if (!existingUser.role) updates.role = "patient";
      if (!existingUser.createdAt) updates.createdAt = Date.now();
      if (existingUser.isActive === undefined) updates.isActive = true;
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
        console.log("createOrUpdateUser: Updated user with fields:", Object.keys(updates));
      }
      return {
        ...existingUser,
        ...updates,
        role: existingUser.role || "patient",
      };
    }

    console.log("createOrUpdateUser: Creating new user for:", identity.email);
    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
      role: "patient",
      isActive: true,
      createdAt: Date.now(),
    });

    const newUser = await ctx.db.get(userId);
    console.log("createOrUpdateUser: Created new user:", userId);
    return newUser;
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