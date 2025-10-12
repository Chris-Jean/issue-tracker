import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  issues: defineTable({
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
    imageUrl: v.optional(v.id("_storage")),
    image: v.optional(v.id("_storage")),
    archived: v.optional(v.boolean()),
    deleted: v.optional(v.boolean()),
  })
    .index("by_agent", ["agent"])
    .index("by_title", ["title"])
    .index("by_category", ["category"]),
});
