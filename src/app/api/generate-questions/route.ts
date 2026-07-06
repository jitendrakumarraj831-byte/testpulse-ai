import { NextResponse } from "next/server";
import {
  DIFFICULTY_LEVELS,
  generateMockQuestions,
  type ApiQuestion,
  type DifficultyLevel,
  type GenerateQuestionsResponse,
} from "@/lib/admin/question-generator";

const MIN_COUNT = 1;
const MAX_COUNT = 30;
const DEFAULT_COUNT = 10;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const GEMINI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";

interface RequestBody {
  subject?: unknown;
  topic?: unknown;
  count?: unknown;
  difficulty?: unknown;
}

function normalizeDifficulty(value: unknown): DifficultyLevel {
  return typeof value === "string" &&
    (DIFFICULTY_LEVELS as readonly string[]).includes(value)
    ? (value as DifficultyLevel)
    : "Medium";
}

function normalizeCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_COUNT;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(parsed)));
}

function buildPrompt(
  subject: string,
  topic: string,
  count: number,
  difficulty: DifficultyLevel,
): string {
  return `You are an expert exam question writer. Generate exactly ${count} multiple-choice questions about the topic "${topic}" within the subject "${subject}", calibrated to ${difficulty} difficulty.

Respond with ONLY valid JSON — no markdown, no code fences, no commentary — matching exactly this shape:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": string
    }
  ]
}

Rules:
- Return exactly ${count} items in "questions".
- "id" is the 1-based question number.
- "options" must contain exactly 4 distinct answer choices, written as plain text (no "A)" style prefixes).
- "correctAnswer" is the letter for the correct option's position: A = options[0], B = options[1], C = options[2], D = options[3].
- "explanation" briefly justifies why the correct answer is correct.
- Do not include any text outside the JSON object.`;
}

function mockFallback(
  subject: string,
  topic: string,
  count: number,
  difficulty: DifficultyLevel,
): ApiQuestion[] {
  return generateMockQuestions({
    subject,
    topic,
    totalQuestions: count,
    difficulty,
  }).map((question, index) => ({
    id: index + 1,
    question: question.prompt,
    options: question.options.map((option) => option.text),
    correctAnswer: question.correctLabel,
    explanation: question.explanation,
  }));
}

function isApiQuestion(value: unknown): value is ApiQuestion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.question === "string" &&
    Array.isArray(candidate.options) &&
    candidate.options.length === 4 &&
    candidate.options.every((option) => typeof option === "string") &&
    typeof candidate.correctAnswer === "string" &&
    (OPTION_LABELS as readonly string[]).includes(candidate.correctAnswer) &&
    typeof candidate.explanation === "string"
  );
}

function isValidPayload(
  value: unknown,
): value is { questions: ApiQuestion[] } {
  if (!value || typeof value !== "object" || !("questions" in value)) {
    return false;
  }
  const questions = (value as { questions: unknown }).questions;
  return Array.isArray(questions) && questions.length > 0 && questions.every(isApiQuestion);
}

async function callGemini(prompt: string, apiKey: string): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini response did not contain any text content");
  }

  return JSON.parse(text);
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

  if (!subject || !topic) {
    return NextResponse.json(
      { error: "Both 'subject' and 'topic' are required." },
      { status: 400 },
    );
  }

  const count = normalizeCount(body.count);
  const difficulty = normalizeDifficulty(body.difficulty);
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const payload: GenerateQuestionsResponse = {
      questions: mockFallback(subject, topic, count, difficulty),
      source: "mock",
    };
    return NextResponse.json(payload);
  }

  try {
    const prompt = buildPrompt(subject, topic, count, difficulty);
    const parsed = await callGemini(prompt, apiKey);

    if (!isValidPayload(parsed)) {
      throw new Error("AI response failed structured JSON validation.");
    }

    const payload: GenerateQuestionsResponse = {
      questions: parsed.questions.slice(0, count).map((question, index) => ({
        id: index + 1,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      })),
      source: "ai",
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "[generate-questions] AI generation failed, falling back to mock generator:",
      error,
    );
    const payload: GenerateQuestionsResponse = {
      questions: mockFallback(subject, topic, count, difficulty),
      source: "mock",
    };
    return NextResponse.json(payload);
  }
}
