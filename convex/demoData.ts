import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Demo data constants
const DEMO_MARKER = "[DEMO]";

const SERVICE_NUMBERS = [
  "12075601050", "12077075147", "12085726420", "12085726840", "12176454020",
  "12252809390", "12402525600", "13042050870", "13043090045", "13123800108",
  "13174447240", "14053692050", "14054021091", "14062351010", "14064054235"
];

const PROJECT_NAMES = [
  "ME: A - DMCV - Automated TI",
  "ME: B - DMCB - Automated TI",
  "ID: A - DMCV - Automated TI",
  "IL: B - DMCV - Automated TI",
  "LA: A - DMCV - Automated TI",
  "MD: A - DMCV - Automated TI",
  "WV: B - DMCV - Automated TI",
  "NY: A - DMCB - Automated TI - Voice - NY CAS"
];

const CLIENTS = [
  "Austin Consolidation",
  "BVI",
  "CA DDTP",
  "CA Foster Youth",
  "CA HCO",
  "Colorado EB",
  "Cover VA Appeals",
  "Florida Healthy Kids",
  "Illinois EB",
  "Kansas Full Service",
  "MA BSS",
  "Michigan MI EBS",
  "NY CAS Assessors",
  "NY PASRR",
  "TX EB"
];

const LANGUAGES = [
  "Spanish",
  "Mandarin",
  "Cantonese",
  "French",
  "Arabic",
  "Vietnamese",
  "Korean",
  "Russian",
  "Portuguese",
  "Hindi",
  "Bengali",
  "Urdu",
  "Italian",
  "Polish"
];

const CATEGORIES = ["Client issues", "Rude Clients"];

const REASONS = [
  "Maximus agent hung up",
  "Direct Patient Transfer",
  "Patient Left on Call",
  "Call came in on hold"
];

const DESCRIPTIONS = [
  "Client was unable to complete verification process",
  "Technical difficulties during call transfer",
  "Client disconnected before issue resolution",
  "Long wait time caused client frustration",
  "Language barrier caused communication issues",
  "System timeout during authentication",
  "Client requested supervisor escalation",
  "Multiple transfers led to dropped call",
  "Client expressed dissatisfaction with service",
  "Documentation issue prevented completion"
];

// Generate random demo data
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCallerID(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${DEMO_MARKER} ${area}-${exchange}-${number}`;
}

function generateRandomDate(daysBack: number): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);

  return date.toISOString();
}

// ============================================
// Generate Demo Data
// ============================================
export const generateDemoData = mutation({
  args: {
    count: v.optional(v.number()),
    daysBack: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const count = args.count || 100;
    const daysBack = args.daysBack || 30;

    const generatedIds = [];

    for (let i = 0; i < count; i++) {
      const issueData = {
        title: generateCallerID(),
        agent: getRandomItem(SERVICE_NUMBERS),
        language: getRandomItem(LANGUAGES),
        description: getRandomItem(DESCRIPTIONS),
        userType: getRandomItem(CLIENTS),
        internetSource: getRandomItem(PROJECT_NAMES),
        category: getRandomItem(CATEGORIES),
        reason: getRandomItem(REASONS),
        dateOfIncident: generateRandomDate(daysBack),
        archived: false,
        deleted: false
      };

      const id = await ctx.db.insert("issues", issueData);
      generatedIds.push(id);
    }

    return {
      message: `Generated ${count} demo issues`,
      count: generatedIds.length,
      ids: generatedIds
    };
  }
});

// ============================================
// Wipe Demo Data
// ============================================
export const wipeDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all issues and filter in JavaScript
    const allIssues = await ctx.db.query("issues").collect();
    const demoIssues = allIssues.filter(issue =>
      issue.title.startsWith(DEMO_MARKER)
    );

    // Delete all demo issues
    for (const issue of demoIssues) {
      await ctx.db.delete(issue._id);
    }

    return {
      message: `Deleted ${demoIssues.length} demo issues`,
      count: demoIssues.length
    };
  }
});

// ============================================
// Count Demo Data
// ============================================
export const countDemoData = query({
  args: {},
  handler: async (ctx) => {
    // Get all issues and filter in JavaScript
    const allIssues = await ctx.db.query("issues").collect();
    const demoIssues = allIssues.filter(issue =>
      issue.title.startsWith(DEMO_MARKER)
    );

    return {
      count: demoIssues.length,
      hasDemo: demoIssues.length > 0
    };
  }
});

// ============================================
// Get Database Stats
// ============================================
export const getDatabaseStats = query({
  args: {},
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();

    const demoIssues = allIssues.filter(issue =>
      issue.title.startsWith(DEMO_MARKER)
    );

    const activeIssues = allIssues.filter(issue =>
      !issue.archived && !issue.deleted
    );

    const archivedIssues = allIssues.filter(issue => issue.archived);
    const deletedIssues = allIssues.filter(issue => issue.deleted);

    return {
      total: allIssues.length,
      demo: demoIssues.length,
      active: activeIssues.length,
      archived: archivedIssues.length,
      deleted: deletedIssues.length,
      real: allIssues.length - demoIssues.length
    };
  }
});
