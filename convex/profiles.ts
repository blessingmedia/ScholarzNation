import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const createProfile = mutation({
  args: {
    displayName: v.string(),
    university: v.string(),
    course: v.string(),
    year: v.number(),
    country: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName,
      university: args.university,
      course: args.course,
      year: args.year,
      country: args.country,
      bio: args.bio,
      reputation: 0,
      documentsShared: 0,
      helpfulAnswers: 0,
      studyStreak: 0,
      achievements: [],
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    university: v.optional(v.string()),
    course: v.optional(v.string()),
    year: v.optional(v.number()),
    country: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates: any = {};
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.university !== undefined) updates.university = args.university;
    if (args.course !== undefined) updates.course = args.course;
    if (args.year !== undefined) updates.year = args.year;
    if (args.country !== undefined) updates.country = args.country;
    if (args.bio !== undefined) updates.bio = args.bio;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

export const getTopContributors = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_reputation")
      .order("desc")
      .take(10);

    return profiles;
  },
});
