import { NextResponse } from "next/server";
import { callGroqChat, type GroqChatMessage } from "@/lib/ai/groq";

export interface ChatResponse {
  reply: string;
  source: "ai" | "unconfigured" | "error";
}

interface RequestBody {
  messages?: unknown;
}

const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 4000;

const SYSTEM_PROMPT = `You are "AI Guru," a friendly, expert academic doubt-solver embedded in TestPulse AI, a platform for exam-prep students. A student is asking you questions about their coursework — math, physics, chemistry, biology, and general exam topics.

Rules:
- Explain concepts step by step, the way a great tutor would — clear, encouraging, never condescending.
- Use markdown for readability: headings for multi-part answers, **bold** for key terms, numbered/bulleted steps for procedures, and code fences for any formula, equation, or code.
- Keep answers focused and exam-relevant. If a question is ambiguous, ask a brief clarifying question instead of guessing.
- If asked something entirely unrelated to academics/studying, politely redirect the student back to their coursework instead of answering.
- Never fabricate facts, dates, or formulas you're unsure of — say so plainly instead.`;

function isGroqChatMessage(value: unknown): value is GroqChatMessage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "assistant") &&
    typeof v.content === "string" &&
    v.content.trim().length > 0 &&
    v.content.length <= MAX_MESSAGE_LENGTH
  );
}

const UNCONFIGURED_REPLY =
  "The AI Guru engine isn't connected yet in this environment — ask an admin to set `GROQ_API_KEY` (or `AI_API_KEY`) so I can start answering questions.";

const ERROR_REPLY =
  "I couldn't reach the AI engine just now. Please try again in a moment.";

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const history = rawMessages.filter(isGroqChatMessage).slice(-MAX_HISTORY);

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "`messages` must be a non-empty array ending with a user message." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    const payload: ChatResponse = { reply: UNCONFIGURED_REPLY, source: "unconfigured" };
    return NextResponse.json(payload);
  }

  try {
    const reply = await callGroqChat(SYSTEM_PROMPT, history, apiKey);
    const payload: ChatResponse = { reply, source: "ai" };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[chat] Groq call failed:", error);
    const payload: ChatResponse = { reply: ERROR_REPLY, source: "error" };
    return NextResponse.json(payload);
  }
}
