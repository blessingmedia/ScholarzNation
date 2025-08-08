import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createStudyGroup = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    subject: v.string(),
    university: v.string(),
    maxMembers: v.number(),
    isPrivate: v.boolean(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("studyGroups", {
      name: args.name,
      description: args.description,
      subject: args.subject,
      university: args.university,
      creatorId: userId,
      members: [userId],
      maxMembers: args.maxMembers,
      isPrivate: args.isPrivate,
      tags: args.tags,
    });
  },
});

export const getStudyGroups = query({
  args: {
    subject: v.optional(v.string()),
    university: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let groups;

    if (args.subject) {
      groups = await ctx.db
        .query("studyGroups")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject!))
        .order("desc")
        .take(20);
    } else if (args.university) {
      groups = await ctx.db
        .query("studyGroups")
        .withIndex("by_university", (q) => q.eq("university", args.university!))
        .order("desc")
        .take(20);
    } else {
      groups = await ctx.db
        .query("studyGroups")
        .order("desc")
        .take(20);
    }

    // Get creator profiles
    const groupsWithCreators = await Promise.all(
      groups.map(async (group) => {
        const creator = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", group.creatorId))
          .unique();
        
        return {
          ...group,
          creatorName: creator?.displayName || "Anonymous",
          memberCount: group.members.length,
        };
      })
    );

    return groupsWithCreators;
  },
});

export const joinStudyGroup = mutation({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.members.includes(userId)) {
      throw new Error("Already a member");
    }

    if (group.members.length >= group.maxMembers) {
      throw new Error("Group is full");
    }

    await ctx.db.patch(args.groupId, {
      members: [...group.members, userId],
    });

    return args.groupId;
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allGroups = await ctx.db.query("studyGroups").collect();
    const userGroups = allGroups.filter(group => group.members.includes(userId));

    return userGroups;
  },
});
