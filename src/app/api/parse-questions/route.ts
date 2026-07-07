import { NextResponse } from "next/server";
import { isApiQuestion, type ApiQuestion } from "@/lib/admin/question-generator";
import { heuristicParseRawText } from "@/lib/admin/question-parser";
import { callGeminiJSON } from "@/lib/ai/gemini";

export interface ParseQuestionsResponse {
  questions: ApiQuestion[];
  source: "ai" | "heuristic";
}

interface RequestBody {
  rawText?: unknown;
}

function buildPrompt(rawText: string): string {
  return `You are an expert exam data extraction engine. The text below was pasted from a plain paper document, scanned notes, or an informally formatted question set. Extract every multiple-choice question you can find and convert it into clean structured JSON.

Raw text:
"""
${rawText}
"""

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
- Extract every distinct question found in the text, in the order they appear.
- "id" is the 1-based question number in the extracted order (it does not need to match any numbering in the source text).
- "options" must contain exactly 4 answer choices as plain text, with any "A)", "B.", etc. prefixes stripped.
- If the source text explicitly marks a correct answer (e.g. "Answer: B", "Correct: C"), use that. If none is marked, infer the most defensible correct answer from context.
- "explanation" briefly justifies the correct answer, using the source text if it already includes one, otherwise write a short original justification.
- Skip any question that does not have exactly 4 identifiable options.
- Do not include any text outside the JSON object.`;
}

function isValidPayload(value: unknown): value is { questions: ApiQuestion[] } {
  if (!value || typeof value !== "object" || !("questions" in value)) {
    return false;
  }
  const questions = (value as { questions: unknown }).questions;
  return (
    Array.isArray(questions) && questions.length > 0 && questions.every(isApiQuestion)
  );
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";

  if (!rawText) {
    return NextResponse.json(
      { error: "'rawText' is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const payload: ParseQuestionsResponse = {
      questions: heuristicParseRawText(rawText),
      source: "heuristic",
    };
    return NextResponse.json(payload);
  }

  try {
    const prompt = buildPrompt(rawText);
    const parsed = await callGeminiJSON(prompt, apiKey);

    if (!isValidPayload(parsed)) {
      throw new Error("AI response failed structured JSON validation.");
    }

    const payload: ParseQuestionsResponse = {
      questions: parsed.questions.map((question, index) => ({
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
      "[parse-questions] AI parsing failed, falling back to heuristic parser:",
      error,
    );
    const payload: ParseQuestionsResponse = {
      questions: heuristicParseRawText(rawText),
      source: "heuristic",
    };
    return NextResponse.json(payload);
  }
}
