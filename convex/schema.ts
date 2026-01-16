import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// IVF Patient Support Platform Schema
export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        tokenIdentifier: v.string(),
        role: v.optional(v.union(v.literal("patient"), v.literal("staff"), v.literal("admin"))),
        createdAt: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_role", ["role"])
        .index("by_email", ["email"]),

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
        topic: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_user", ["userId"])
        .index("by_created", ["createdAt"])
        .index("by_topic", ["topic"]),

    analytics: defineTable({
        topic: v.string(),
        count: v.number(),
        date: v.string(),
        lastUpdated: v.number(),
    })
        .index("by_date", ["date"])
        .index("by_topic", ["topic"]),

    // Vector embeddings for RAG
    vectorEmbeddings: defineTable({
        content: v.string(),
        embedding: v.array(v.float64()),
        source: v.optional(v.string()),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
    })
        .index("by_source", ["source"])
        .index("by_created", ["createdAt"]),

    // RAG configuration and settings
    ragConfig: defineTable({
        key: v.string(),
        value: v.any(),
        updatedAt: v.number(),
    })
        .index("by_key", ["key"]),

    // Staff activity logs
    activityLogs: defineTable({
        userId: v.id("users"),
        action: v.string(),
        details: v.optional(v.string()),
        targetType: v.optional(v.string()),
        targetId: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_action", ["action"])
        .index("by_created", ["createdAt"]),
});
