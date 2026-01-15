import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAnalyticsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_date")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
    return analytics;
  },
});

export const getTopicAnalytics = query({
  args: {
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.topic) {
      const analytics = await ctx.db
        .query("analytics")
        .withIndex("by_topic", (q) => q.eq("topic", args.topic))
        .collect();
      return analytics;
    } else {
      const analytics = await ctx.db
        .query("analytics")
        .collect();
      return analytics;
    }
  },
});

export const updateTopicCount = mutation({
  args: {
    topic: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Find existing analytics entry
    const existing = await ctx.db
      .query("analytics")
      .withIndex("by_date")
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("topic"), args.topic)
        )
      )
      .first();

    if (existing) {
      // Increment count
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new entry
      await ctx.db.insert("analytics", {
        topic: args.topic,
        count: 1,
        date: args.date,
        lastUpdated: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getMessageVolumeByDate = query({
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

    // Group by date
    const volumeByDate: Record<string, number> = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toISOString().split('T')[0];
      volumeByDate[date] = (volumeByDate[date] || 0) + 1;
    });

    return volumeByDate;
  },
});
