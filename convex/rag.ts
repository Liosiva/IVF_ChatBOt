import { v } from "convex/values";
import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";

// Store vector embedding
export const storeEmbedding = mutation({
  args: {
    content: v.string(),
    embedding: v.array(v.float64()),
    source: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("vectorEmbeddings", {
      content: args.content,
      embedding: args.embedding,
      source: args.source,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
    return id;
  },
});

// Batch store embeddings
export const batchStoreEmbeddings = mutation({
  args: {
    embeddings: v.array(v.object({
      content: v.string(),
      embedding: v.array(v.float64()),
      source: v.optional(v.string()),
      metadata: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const emb of args.embeddings) {
      const id = await ctx.db.insert("vectorEmbeddings", {
        content: emb.content,
        embedding: emb.embedding,
        source: emb.source,
        metadata: emb.metadata,
        createdAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

// Get all embeddings (for similarity search)
export const getAllEmbeddings = query({
  handler: async (ctx) => {
    const embeddings = await ctx.db
      .query("vectorEmbeddings")
      .collect();
    return embeddings;
  },
});

// Get embeddings by source
export const getEmbeddingsBySource = query({
  args: {
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const embeddings = await ctx.db
      .query("vectorEmbeddings")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .collect();
    return embeddings;
  },
});

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic search using cosine similarity
export const semanticSearch = query({
  args: {
    queryEmbedding: v.array(v.float64()),
    topK: v.optional(v.number()),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const topK = args.topK ?? 4;
    const threshold = args.threshold ?? 0.5;
    
    const allEmbeddings = await ctx.db
      .query("vectorEmbeddings")
      .collect();
    
    // Calculate similarity scores
    const scoredDocs = allEmbeddings.map(doc => ({
      ...doc,
      score: cosineSimilarity(args.queryEmbedding, doc.embedding),
    }));
    
    // Filter by threshold and sort by score
    const results = scoredDocs
      .filter(doc => doc.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    
    return results;
  },
});

// Delete embedding
export const deleteEmbedding = mutation({
  args: {
    embeddingId: v.id("vectorEmbeddings"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.embeddingId);
    return { success: true };
  },
});

// Clear all embeddings
export const clearAllEmbeddings = mutation({
  handler: async (ctx) => {
    const embeddings = await ctx.db
      .query("vectorEmbeddings")
      .collect();
    
    for (const emb of embeddings) {
      await ctx.db.delete(emb._id);
    }
    
    return { deleted: embeddings.length };
  },
});

// Get RAG config
export const getRagConfig = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("ragConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return config;
  },
});

// Set RAG config
export const setRagConfig = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ragConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("ragConfig", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

// Get embedding count
export const getEmbeddingCount = query({
  handler: async (ctx) => {
    const embeddings = await ctx.db
      .query("vectorEmbeddings")
      .collect();
    return embeddings.length;
  },
});

// Search by content (text search fallback)
export const searchByContent = query({
  args: {
    searchText: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchLower = args.searchText.toLowerCase();
    
    const embeddings = await ctx.db
      .query("vectorEmbeddings")
      .collect();
    
    const results = embeddings
      .filter(emb => emb.content.toLowerCase().includes(searchLower))
      .slice(0, limit);
    
    return results;
  },
});
