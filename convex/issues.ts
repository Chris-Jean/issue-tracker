import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create
export const createIssue = mutation({
  args: {
    title: v.string(),
    agent: v.string(),
    language: v.string(),
    description: v.string(),
    userType: v.string(),
    VPN: v.string(),
    internetSource: v.string(),
    category: v.string(),
    dateOfIncident: v.string(),
  },
  handler: async (ctx, args) => {
    const issueId = await ctx.db.insert("issues", args);
    return issueId;
  },
});

// Read
export const getIssues = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("issues").collect();
  },
});

export const getIssue = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update
export const updateIssue = mutation({
  args: {
    _id: v.id("issues"),
    title: v.optional(v.string()),
    agent: v.optional(v.string()),
    language: v.optional(v.string()),
    description: v.optional(v.string()),
    userType: v.optional(v.string()),
    VPN: v.optional(v.string()),
    internetSource: v.optional(v.string()),
    category: v.optional(v.string()),
    dateOfIncident: v.optional(v.string()),
    _creationTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { _id, _creationTime, ...fields } = args;
    await ctx.db.patch(_id, fields);
  },
});

// Delete
export const deleteIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get by Identifier (agent, title, or category)
export const getByIdentifier = query({
  args: {
    identifier: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.identifier === "agent") {
      return await ctx.db
        .query("issues")
        .withIndex("by_agent", (q) => q.eq("agent", args.value))
        .collect();
    } else if (args.identifier === "title") {
      return await ctx.db
        .query("issues")
        .withIndex("by_title", (q) => q.eq("title", args.value))
        .collect();
    } else if (args.identifier === "category") {
      return await ctx.db
        .query("issues")
        .withIndex("by_category", (q) => q.eq("category", args.value))
        .collect();
    } else {
      throw new Error(
        "Invalid identifier. Use 'agent', 'title', or 'category'."
      );
    }
  },
});
