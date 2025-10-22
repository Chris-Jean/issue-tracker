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
  args: v.object({
    title: v.string(),
    agent: v.string(),
    language: v.string(),
    description: v.string(),
    userType: v.string(),
    VPN: v.optional(v.string()),
    internetSource: v.string(),
    category: v.string(),
    reason: v.optional(v.string()),
    dateOfIncident: v.string(),
    image: v.optional(v.id("_storage")),
    archived: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    try {
      const { image, ...issueData } = args;
      const issue = image ? { ...issueData, image } : issueData;

      // ✅ Ensure all new issues start unarchived
      const issueId = await ctx.db.insert("issues", {
        ...issue,
        archived: args.archived ?? false,
      });

      return issueId;
    } catch (error) {
      console.error("Error creating issue:", error);
      throw new Error("Failed to create issue. Please try again.");
    }
  },
});

// Read
export const getIssues = query({
  args: {},
  handler: async (ctx) => {
    const issues = await ctx.db
      .query("issues")
      .filter((q) =>
        q.and(
          q.or(q.eq(q.field("archived"), false), q.eq(q.field("archived"), undefined)),
          q.or(q.eq(q.field("deleted"), false), q.eq(q.field("deleted"), undefined))
        )
      )
      .collect();

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
// ✅ Convex: Delete only non-archived issues
export const deleteIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (!issue) throw new Error("Issue not found");

    // 🚫 Prevent deleting archived issues (safety check)
    if (issue.archived) {
      throw new Error("Cannot delete archived issue from dashboard");
    }

    // ✅ Soft delete instead of permanent removal
    await ctx.db.patch(args.id, { deleted: true });
    return { message: "Issue marked as deleted" };
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
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db.query("issues").collect();

    if (args.startDate || args.endDate) {
      issues = issues.filter((issue) => {
        const incidentDate = new Date(issue.dateOfIncident).getTime();
        const afterStart = args.startDate ? incidentDate >= new Date(args.startDate).getTime() : true;
        const beforeEnd = args.endDate ? incidentDate <= new Date(args.endDate).getTime() : true;
        return afterStart && beforeEnd;
      });
    }

    // 🧹 Drop image fields before returning
    return issues.map(({ image, ...rest }) => rest);
  },
});

// ✅ Archive an issue instead of deleting
export const archiveIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archived: true });
  },
});

// ✅ Get only archived issues
export const getArchivedIssues = query({
  args: {},
  handler: async (ctx) => {
    const archivedIssues = await ctx.db
      .query("issues")
      .filter((q) =>
        q.and(
          q.eq(q.field("archived"), true),
          q.or(q.eq(q.field("deleted"), false), q.eq(q.field("deleted"), undefined))
        )
      )
      .collect();

    return await Promise.all(
      archivedIssues.map(async (issue) => {
        if (issue.image) {
          const imageUrl = await ctx.storage.getUrl(issue.image);
          return { ...issue, imageUrl };
        }
        return issue;
      })
    );
  },
});

// ✅ Get only active (non-archived) issues for the dashboard
export const getActiveIssues = query({
  args: {},
  handler: async (ctx) => {
    const issues = await ctx.db
      .query("issues")
      .filter((q) =>
        q.or(q.eq(q.field("archived"), false), q.eq(q.field("archived"), undefined))
      )
      .collect();

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

// ✅ Archive All Issues (sets archived = true)
export const archiveAllIssues = mutation({
  args: {},
  handler: async (ctx) => {
    const allIssues = await ctx.db
      .query("issues")
      .filter(q =>
        q.or(q.eq(q.field("archived"), false), q.eq(q.field("archived"), undefined))
      )
      .collect();

    for (const issue of allIssues) {
      await ctx.db.patch(issue._id, { archived: true });
    }

    return { count: allIssues.length };
  },
});


// ✅ Delete All Non-Archived Issues
export const deleteAllActiveIssues = mutation({
  args: {},
  handler: async (ctx) => {
    // ✅ Only delete issues that are NOT archived
    const activeIssues = await ctx.db
      .query("issues")
      .filter((q) =>
        q.and(
          q.or(q.eq(q.field("archived"), false), q.eq(q.field("archived"), undefined)),
          q.or(q.eq(q.field("deleted"), false), q.eq(q.field("deleted"), undefined))
        )
      )
      .collect();

    for (const issue of activeIssues) {
      if (issue.image) await ctx.storage.delete(issue.image);
      await ctx.db.delete(issue._id);
    }

    return { message: `Deleted ${activeIssues.length} active issues successfully.` };
  },
});
