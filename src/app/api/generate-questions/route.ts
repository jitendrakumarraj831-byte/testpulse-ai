import { NextResponse } from "next/server";
import {
  DIFFICULTY_LEVELS,
  generateMockQuestions,
  isApiQuestion,
  type ApiQuestion,
  type DifficultyLevel,
  type GenerateQuestionsResponse,
} from "@/lib/admin/question-generator";
import { callGeminiJSON } from "@/lib/ai/gemini";

const MIN_COUNT = 1;
const MAX_COUNT = 30;
const DEFAULT_COUNT = 10;

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

function isValidPayload(
  value: unknown,
): value is { questions: ApiQuestion[] } {
  if (!value || typeof value !== "object" || !("questions" in value)) {
    return false;
  }
  const questions = (value as { questions: unknown }).questions;
  return Array.isArray(questions) && questions.length > 0 && questions.every(isApiQuestion);
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
    const parsed = await callGeminiJSON(prompt, apiKey);

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
