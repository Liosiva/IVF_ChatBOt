import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    // Get the user's identity from the auth context
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (user !== null) {
      // Return user with default role if not set
      return {
        ...user,
        role: user.role || "patient",
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

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    if (existingUser) {
      // Update if needed - also set role if not set
      const updates: Record<string, unknown> = {};
      if (existingUser.name !== identity.name) updates.name = identity.name;
      if (existingUser.email !== identity.email) updates.email = identity.email;
      if (!existingUser.role) updates.role = "patient";
      if (!existingUser.createdAt) updates.createdAt = Date.now();
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }
      return {
        ...existingUser,
        ...updates,
        role: existingUser.role || "patient",
      };
    }

    // Create new user with default "patient" role
    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
      role: "patient",
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});