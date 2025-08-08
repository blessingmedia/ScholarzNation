import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const uploadDocument = mutation({
  args: {
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
    tags: v.array(v.string()),
    isPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      description: args.description,
      subject: args.subject,
      course: args.course,
      university: args.university,
      documentType: args.documentType,
      fileId: args.fileId,
      uploaderId: userId,
      tags: args.tags,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      isVerified: false,
      isPremium: args.isPremium,
    });

    // Update user's document count
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        documentsShared: profile.documentsShared + 1,
        reputation: profile.reputation + 5,
      });
    }

    return documentId;
  },
});

export const searchDocuments = query({
  args: {
    searchTerm: v.optional(v.string()),
    subject: v.optional(v.string()),
    university: v.optional(v.string()),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let documents;

    if (args.searchTerm) {
      documents = await ctx.db
        .query("documents")
        .withSearchIndex("search_documents", (q) => {
          let searchQuery = q.search("title", args.searchTerm!);
          if (args.subject) searchQuery = searchQuery.eq("subject", args.subject);
          if (args.university) searchQuery = searchQuery.eq("university", args.university);
          if (args.documentType) searchQuery = searchQuery.eq("documentType", args.documentType as any);
          return searchQuery;
        })
        .take(20);
    } else if (args.subject) {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject!))
        .order("desc")
        .take(20);
    } else if (args.university) {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_university", (q) => q.eq("university", args.university!))
        .order("desc")
        .take(20);
    } else {
      documents = await ctx.db
        .query("documents")
        .order("desc")
        .take(20);
    }

    // Get uploader profiles
    const documentsWithUploaders = await Promise.all(
      documents.map(async (doc) => {
        const uploader = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", doc.uploaderId))
          .unique();
        
        return {
          ...doc,
          uploaderName: uploader?.displayName || "Anonymous",
          uploaderReputation: uploader?.reputation || 0,
        };
      })
    );

    return documentsWithUploaders;
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    const uploader = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", document.uploaderId))
      .unique();

    const fileUrl = await ctx.storage.getUrl(document.fileId);

    return {
      ...document,
      uploaderName: uploader?.displayName || "Anonymous",
      uploaderReputation: uploader?.reputation || 0,
      fileUrl,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const incrementDownloads = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    await ctx.db.patch(args.documentId, {
      downloads: document.downloads + 1,
    });
  },
});
