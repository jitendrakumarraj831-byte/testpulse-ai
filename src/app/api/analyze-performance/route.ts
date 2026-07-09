import { NextResponse } from "next/server";
import { callGroqJSON } from "@/lib/ai/groq";

export interface PerformanceItem {
  question: string;
  isCorrect: boolean;
}

export interface AnalyzePerformanceResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  remedialTips: string[];
  source: "ai" | "heuristic";
}

interface RequestBody {
  subjectName?: unknown;
  examTitle?: unknown;
  score?: unknown;
  totalQuestions?: unknown;
  items?: unknown;
}

function isPerformanceItem(value: unknown): value is PerformanceItem {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as PerformanceItem).question === "string" &&
    typeof (value as PerformanceItem).isCorrect === "boolean"
  );
}

function truncate(text: string, max = 90): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function buildPrompt(
  subjectName: string,
  examTitle: string,
  score: number,
  totalQuestions: number,
  items: PerformanceItem[],
): string {
  const percent = Math.round((score / totalQuestions) * 100);
  const itemLines = items
    .map(
      (item, index) =>
        `${index + 1}. [${item.isCorrect ? "CORRECT" : "INCORRECT"}] ${item.question}`,
    )
    .join("\n");

  return `You are an expert academic performance coach. A student just completed a ${subjectName} test titled "${examTitle}" and scored ${score}/${totalQuestions} (${percent}%).

Here is each question and whether they answered it correctly:
${itemLines}

Respond with ONLY valid JSON — no markdown, no code fences, no commentary — matching exactly this shape:
{
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "remedialTips": string[]
}

Rules:
- "summary" is one encouraging sentence characterizing overall performance.
- "strengths" lists 2-4 specific concepts the student appears to understand well, inferred only from questions marked CORRECT. If there's too little signal to infer a real pattern, say so honestly instead of inventing strengths.
- "weaknesses" lists 2-4 specific concepts they appear to be struggling with, inferred only from questions marked INCORRECT. If everything was correct, say there are no notable weaknesses this time.
- "remedialTips" lists 2-3 concrete, actionable study suggestions targeting the weaknesses.
- Keep every string under 160 characters. Do not include markdown formatting.`;
}

function isValidPayload(
  value: unknown,
): value is Omit<AnalyzePerformanceResponse, "source"> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.summary === "string" &&
    Array.isArray(v.strengths) &&
    v.strengths.every((item) => typeof item === "string") &&
    Array.isArray(v.weaknesses) &&
    v.weaknesses.every((item) => typeof item === "string") &&
    Array.isArray(v.remedialTips) &&
    v.remedialTips.every((item) => typeof item === "string")
  );
}

function heuristicFallback(
  subjectName: string,
  score: number,
  totalQuestions: number,
  items: PerformanceItem[],
): Omit<AnalyzePerformanceResponse, "source"> {
  const percent = Math.round((score / totalQuestions) * 100);
  const missed = items.filter((item) => !item.isCorrect).slice(0, 4);
  const correct = items.filter((item) => item.isCorrect).slice(0, 4);

  return {
    summary: `You scored ${score}/${totalQuestions} (${percent}%) on this ${subjectName} test.`,
    strengths:
      correct.length > 0
        ? correct.map((item) => truncate(item.question))
        : ["Not enough correct answers yet to identify a strength pattern."],
    weaknesses:
      missed.length > 0
        ? missed.map((item) => truncate(item.question))
        : ["No notable weak spots — everything here was answered correctly."],
    remedialTips: [
      "Review the explanation for each missed question before retaking this topic.",
      "Retake this test after reviewing the explanations to check retention.",
    ],
  };
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const subjectName =
    typeof body.subjectName === "string" ? body.subjectName.trim() : "";
  const examTitle = typeof body.examTitle === "string" ? body.examTitle.trim() : "";
  const score = typeof body.score === "number" ? body.score : Number(body.score);
  const totalQuestions =
    typeof body.totalQuestions === "number"
      ? body.totalQuestions
      : Number(body.totalQuestions);
  const items = Array.isArray(body.items) ? body.items.filter(isPerformanceItem) : [];

  if (
    !subjectName ||
    !Number.isFinite(score) ||
    !Number.isFinite(totalQuestions) ||
    totalQuestions <= 0 ||
    items.length === 0
  ) {
    return NextResponse.json(
      { error: "subjectName, score, totalQuestions, and items are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    const payload: AnalyzePerformanceResponse = {
      ...heuristicFallback(subjectName, score, totalQuestions, items),
      source: "heuristic",
    };
    return NextResponse.json(payload);
  }

  try {
    const prompt = buildPrompt(subjectName, examTitle, score, totalQuestions, items);
    const parsed = await callGroqJSON(prompt, apiKey);

    if (!isValidPayload(parsed)) {
      throw new Error("AI response failed structured JSON validation.");
    }

    const payload: AnalyzePerformanceResponse = { ...parsed, source: "ai" };
    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "[analyze-performance] AI analysis failed, falling back to heuristic breakdown:",
      error,
    );
    const payload: AnalyzePerformanceResponse = {
      ...heuristicFallback(subjectName, score, totalQuestions, items),
      source: "heuristic",
    };
    return NextResponse.json(payload);
  }
}
