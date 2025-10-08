import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create
export const createIssue = mutation({
  args: {
    title: v.string(),
    agent: v.string(),
    language: v.string(),
    description: v.string(),
    userType: v.string(),
    VPN: v.optional(v.string()),
    internetSource: v.string(),
    category: v.string(),
    reason: v.optional( v.string()),
    dateOfIncident: v.string(),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    try {
    const {image, ...issueData } = args;
    const issue = image ? {...issueData, image } : issueData;

    const issueId = await ctx.db.insert("issues", issue);
    return issueId;
  } catch (error) {
    console.error ("Error creating issue:", error);
    throw new Error("Failed to create issue. Please try again.");
  }
},
});

// Read
export const getIssues = query({
  args: {},
  handler: async (ctx) => {
    const issues = await ctx.db.query("issues").collect();

    // Convert storage IDs to URLs
    return await Promise.all(
      issues.map(async (issue) => {
        if (issue.image) {
          const imageUrl = await ctx.storage.getUrl(issue.image);
          return { ...issue, imageUrl };
        }
        return issue;
      })
    );
  },
});
export const getIssue = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (issue && issue.image) {
      const imageUrl = await ctx.storage.getUrl(issue.image);
      return { ...issue, imageUrl };
    }
    return issue;
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
    reason: v.optional( v.string()),
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
    const issue = await ctx.db.get(args.id);

    // Delete the image from storage if it exists
    if (issue && issue.image) {
      await ctx.storage.delete(issue.image);
    }

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
    let issues;

    if (args.identifier === "agent") {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_agent", (q) => q.eq("agent", args.value))
        .collect();
    } else if (args.identifier === "title") {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_title", (q) => q.eq("title", args.value))
        .collect();
    } else if (args.identifier === "category") {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_category", (q) => q.eq("category", args.value))
        .collect();
    } else {
      throw new Error(
        "Invalid identifier. Use 'agent', 'title', or 'category'."
      );
    }

    // Convert storage IDs to URLs
    return await Promise.all(
      issues.map(async (issue) => {
        if (issue.image) {
          const imageUrl = await ctx.storage.getUrl(issue.image);
          return { ...issue, imageUrl };
        }
        return issue;
      })
    );
  },
});

// 📅 Get Issues Within a Date Range (for archives)
export const getIssuesByDateRange = query({
  args: {
    startDate: v.optional(v.string()), // ISO string or undefined
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db.query("issues").collect();

    // ✅ Filter by date range (server-side)
    if (args.startDate || args.endDate) {
      issues = issues.filter((issue) => {
        const incidentDate = new Date(issue.dateOfIncident).getTime();
        const afterStart = args.startDate ? incidentDate >= new Date(args.startDate).getTime() : true;
        const beforeEnd = args.endDate ? incidentDate <= new Date(args.endDate).getTime() : true;
        return afterStart && beforeEnd;
      });
    }

    // ✅ Convert storage IDs to URLs for preview/download
    return await Promise.all(
      issues.map(async (issue) => {
        if (issue.image) {
          const imageUrl = await ctx.storage.getUrl(issue.image);
          return { ...issue, imageUrl };
        }
        return issue;
      })
    );
  },
});

