import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        tokenIdentifier: v.string(),
        role: v.union(v.literal("patient"), v.literal("staff"), v.literal("admin")),
        createdAt: v.number(),
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_role", ["role"]),

    chatSessions: defineTable({
        userId: v.id("users"),
        title: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_updated", ["updatedAt"]),

    chatMessages: defineTable({
        sessionId: v.id("chatSessions"),
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        sources: v.optional(v.array(v.string())),
        createdAt: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_user", ["userId"])
        .index("by_created", ["createdAt"]),

    analytics: defineTable({
        topic: v.string(),
        count: v.number(),
        date: v.string(), // YYYY-MM-DD format
        lastUpdated: v.number(),
    })
        .index("by_date", ["date"])
        .index("by_topic", ["topic"]),
});
