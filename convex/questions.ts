import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const askQuestion = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subject: v.string(),
    course: v.string(),
    university: v.string(),
    tags: v.array(v.string()),
    bounty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("questions", {
      title: args.title,
      content: args.content,
      subject: args.subject,
      course: args.course,
      university: args.university,
      askerId: userId,
      tags: args.tags,
      bounty: args.bounty,
      isResolved: false,
      views: 0,
      upvotes: 0,
    });
  },
});

export const getQuestions = query({
  args: {
    subject: v.optional(v.string()),
    university: v.optional(v.string()),
    isResolved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let questions;

    if (args.subject) {
      questions = await ctx.db
        .query("questions")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject!))
        .order("desc")
        .take(20);
    } else {
      questions = await ctx.db
        .query("questions")
        .order("desc")
        .take(20);
    }

    // Get asker profiles
    const questionsWithAskers = await Promise.all(
      questions.map(async (question) => {
        const asker = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", question.askerId))
          .unique();
        
        return {
          ...question,
          askerName: asker?.displayName || "Anonymous",
          askerReputation: asker?.reputation || 0,
        };
      })
    );

    return questionsWithAskers;
  },
});

export const answerQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const answerId = await ctx.db.insert("answers", {
      questionId: args.questionId,
      content: args.content,
      answererId: userId,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
    });

    // Update answerer's reputation
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        helpfulAnswers: profile.helpfulAnswers + 1,
        reputation: profile.reputation + 2,
      });
    }

    return answerId;
  },
});

export const getAnswers = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .order("desc")
      .collect();

    // Get answerer profiles
    const answersWithAnswerers = await Promise.all(
      answers.map(async (answer) => {
        const answerer = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", answer.answererId))
          .unique();
        
        return {
          ...answer,
          answererName: answerer?.displayName || "Anonymous",
          answererReputation: answerer?.reputation || 0,
        };
      })
    );

    return answersWithAnswerers;
  },
});
