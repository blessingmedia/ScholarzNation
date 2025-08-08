import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with academic focus
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    university: v.string(),
    course: v.string(),
    year: v.number(),
    country: v.string(),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    reputation: v.number(),
    documentsShared: v.number(),
    helpfulAnswers: v.number(),
    studyStreak: v.number(),
    achievements: v.array(v.string()),
  }).index("by_user", ["userId"])
    .index("by_university", ["university"])
    .index("by_reputation", ["reputation"]),

  // Academic documents
  documents: defineTable({
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    course: v.string(),
    university: v.string(),
    documentType: v.union(
      v.literal("notes"),
      v.literal("assignment"),
      v.literal("exam"),
      v.literal("textbook"),
      v.literal("research")
    ),
    fileId: v.id("_storage"),
    uploaderId: v.id("users"),
    tags: v.array(v.string()),
    downloads: v.number(),
    rating: v.number(),
    ratingCount: v.number(),
    isVerified: v.boolean(),
    isPremium: v.boolean(),
  }).index("by_subject", ["subject"])
    .index("by_university", ["university"])
    .index("by_uploader", ["uploaderId"])
    .index("by_rating", ["rating"])
    .searchIndex("search_documents", {
      searchField: "title",
      filterFields: ["subject", "university", "documentType"]
    }),

  // Study groups for collaboration
  studyGroups: defineTable({
    name: v.string(),
    description: v.string(),
    subject: v.string(),
    university: v.string(),
    creatorId: v.id("users"),
    members: v.array(v.id("users")),
    maxMembers: v.number(),
    isPrivate: v.boolean(),
    meetingSchedule: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index("by_subject", ["subject"])
    .index("by_university", ["university"])
    .index("by_creator", ["creatorId"]),

  // Q&A system for homework help
  questions: defineTable({
    title: v.string(),
    content: v.string(),
    subject: v.string(),
    course: v.string(),
    university: v.string(),
    askerId: v.id("users"),
    tags: v.array(v.string()),
    bounty: v.optional(v.number()),
    isResolved: v.boolean(),
    attachments: v.optional(v.array(v.id("_storage"))),
    views: v.number(),
    upvotes: v.number(),
  }).index("by_subject", ["subject"])
    .index("by_asker", ["askerId"])
    .index("by_resolved", ["isResolved"])
    .searchIndex("search_questions", {
      searchField: "title",
      filterFields: ["subject", "university", "isResolved"]
    }),

  // Answers to questions
  answers: defineTable({
    questionId: v.id("questions"),
    content: v.string(),
    answererId: v.id("users"),
    upvotes: v.number(),
    downvotes: v.number(),
    isAccepted: v.boolean(),
    attachments: v.optional(v.array(v.id("_storage"))),
  }).index("by_question", ["questionId"])
    .index("by_answerer", ["answererId"]),

  // AI tutoring sessions
  aiSessions: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    topic: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })),
    isActive: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_subject", ["subject"]),

  // Study sessions for real-time collaboration
  studySessions: defineTable({
    groupId: v.id("studyGroups"),
    hostId: v.id("users"),
    title: v.string(),
    subject: v.string(),
    participants: v.array(v.id("users")),
    isActive: v.boolean(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    sharedDocuments: v.array(v.id("documents")),
  }).index("by_group", ["groupId"])
    .index("by_host", ["hostId"])
    .index("by_active", ["isActive"]),

  // Notifications system
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("document_shared"),
      v.literal("question_answered"),
      v.literal("study_session"),
      v.literal("achievement"),
      v.literal("group_invite")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_read", ["isRead"]),

  // Document ratings and reviews
  documentReviews: defineTable({
    documentId: v.id("documents"),
    reviewerId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  }).index("by_document", ["documentId"])
    .index("by_reviewer", ["reviewerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
