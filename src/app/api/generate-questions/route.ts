import { NextResponse } from "next/server";
import {
  DIFFICULTY_LEVELS,
  generateMockQuestions,
  isApiQuestion,
  type ApiQuestion,
  type DifficultyLevel,
  type GenerateQuestionsResponse,
} from "@/lib/admin/question-generator";
import { callGeminiJSON, GeminiApiError } from "@/lib/ai/gemini";

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
  return `You are an expert exam question writer creating authentic, textbook-quality multiple-choice questions for a competitive exam.

Topic — the ONLY subject matter the questions are about: "${topic}"
Category — a background classification label for filing this paper, NOT something to write questions about: "${subject}"
Difficulty: ${difficulty}

Generate exactly ${count} multiple-choice questions.

THE STRICT RULE:
- "${topic}" is the absolute and sole core theme of every question, option, and explanation. Write pure, authentic content on "${topic}" exactly as it would appear in a real textbook or competitive-exam paper dedicated to that topic.
- "${subject}" exists only for internal classification. NEVER mention it, reference it, or work it into the question text, options, or explanation — do not write constructions like "${topic} within ${subject}", "${topic} as covered in ${subject}", "${topic} under ${subject}", or anything structurally similar. That pattern is forbidden.
- If "${subject}" and "${topic}" seem mismatched (e.g. category "General Knowledge" paired with topic "Rotational Dynamics"), trust the topic completely and write real, substantive questions about it — ignore the category label entirely when writing content.
- Use natural, standard textbook phrasing exactly as a real exam-paper author would write it. Never produce an artificial sentence that stitches the topic and category names together.

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
- "explanation" briefly justifies why the correct answer is correct, using only "${topic}" terminology.
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

  // No key configured at all is a deliberate "Gemini isn't set up in this
  // environment" state, not a Gemini failure — mock output here is
  // expected (e.g. local dev without secrets), so this branch stays.
  if (!apiKey) {
    const payload: GenerateQuestionsResponse = {
      questions: mockFallback(subject, topic, count, difficulty),
      source: "mock",
    };
    return NextResponse.json(payload);
  }

  // Past this point a key IS configured, so the caller wants real Gemini
  // output. No silent mock fallback: any failure — rate limits, auth
  // errors, a malformed response — is surfaced immediately with Google's
  // own status code and error body so it's never mistaken for a working
  // AI response.
  let parsed: unknown;
  try {
    const prompt = buildPrompt(subject, topic, count, difficulty);
    parsed = await callGeminiJSON(prompt, apiKey);
  } catch (error) {
    if (error instanceof GeminiApiError) {
      console.error(
        "[generate-questions] Gemini API error:",
        error.status,
        error.body,
      );
      return NextResponse.json(
        { error: "Gemini API request failed.", geminiError: error.body },
        { status: error.status },
      );
    }

    console.error("[generate-questions] Unexpected error calling Gemini:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error calling Gemini.",
      },
      { status: 500 },
    );
  }

  if (!isValidPayload(parsed)) {
    console.error(
      "[generate-questions] Gemini response failed structured JSON validation:",
      parsed,
    );
    return NextResponse.json(
      {
        error: "Gemini response failed structured JSON validation.",
        geminiResponse: parsed,
      },
      { status: 502 },
    );
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
}
