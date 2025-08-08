import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { api } from "./_generated/api";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const startAITutoring = action({
  args: {
    subject: v.string(),
    topic: v.string(),
    initialQuestion: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; response: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const systemPrompt = `You are Kwame, an AI tutor for Scholarz Nation, specializing in helping African students excel academically. You are knowledgeable, encouraging, and culturally aware. Your goal is to help students understand concepts deeply while celebrating African academic excellence.

Subject: ${args.subject}
Topic: ${args.topic}

Provide clear, step-by-step explanations. Use examples relevant to African contexts when appropriate. Always encourage the student and remind them of their potential for greatness.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: args.initialQuestion }
      ],
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content || "I'm here to help you succeed!";

    // Create AI session
    const sessionId: string = await ctx.runMutation(api.ai.createSession, {
      subject: args.subject,
      topic: args.topic,
      messages: [
        {
          role: "user",
          content: args.initialQuestion,
          timestamp: Date.now(),
        },
        {
          role: "assistant",
          content: aiResponse,
          timestamp: Date.now(),
        }
      ],
    });

    return { sessionId, response: aiResponse };
  },
});

export const continueAITutoring = action({
  args: {
    sessionId: v.id("aiSessions"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.runQuery(api.ai.getSession, { sessionId: args.sessionId });
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    const messages = session.messages.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    messages.push({ role: "user", content: args.message });

    const response: any = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are Kwame, an AI tutor for Scholarz Nation. Continue helping this student with ${session.subject} - ${session.topic}. Be encouraging and provide clear explanations.`
        },
        ...messages
      ],
      temperature: 0.7,
    });

    const aiResponse: string = response.choices[0].message.content || "Let me help you with that!";

    // Update session with new messages
    await ctx.runMutation(api.ai.addMessage, {
      sessionId: args.sessionId,
      userMessage: args.message,
      aiResponse,
    });

    return aiResponse;
  },
});

import { query, mutation } from "./_generated/server";

export const createSession = mutation({
  args: {
    subject: v.string(),
    topic: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("aiSessions", {
      userId,
      subject: args.subject,
      topic: args.topic,
      messages: args.messages,
      isActive: true,
    });
  },
});

export const getSession = query({
  args: { sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("aiSessions"),
    userMessage: v.string(),
    aiResponse: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const newMessages = [
      ...session.messages,
      {
        role: "user" as const,
        content: args.userMessage,
        timestamp: Date.now(),
      },
      {
        role: "assistant" as const,
        content: args.aiResponse,
        timestamp: Date.now(),
      }
    ];

    await ctx.db.patch(args.sessionId, { messages: newMessages });
  },
});

export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});
