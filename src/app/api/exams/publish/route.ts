import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  DIFFICULTY_LEVELS,
  isApiQuestion,
  type PublishExamRequestBody,
  type PublishExamResponse,
} from "@/lib/admin/question-generator";
import { supabase } from "@/lib/supabase";

function isValidBody(value: unknown): value is PublishExamRequestBody {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.subject === "string" &&
    candidate.subject.trim().length > 0 &&
    typeof candidate.topic === "string" &&
    candidate.topic.trim().length > 0 &&
    typeof candidate.difficulty === "string" &&
    (DIFFICULTY_LEVELS as readonly string[]).includes(candidate.difficulty) &&
    Array.isArray(candidate.questions) &&
    candidate.questions.length > 0 &&
    candidate.questions.every(isApiQuestion)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error:
          "A valid 'subject', 'topic', 'difficulty', and non-empty 'questions' array are required.",
      },
      { status: 400 },
    );
  }

  const { subject, topic, difficulty, questions } = body;
  const title = body.title?.trim() || `${subject}: ${topic}`;

  if (!supabase) {
    const id = randomUUID();
    const payload: PublishExamResponse = {
      id,
      url: `/test/${id}`,
      source: "simulated",
    };
    return NextResponse.json(payload);
  }

  try {
    const { data, error } = await supabase
      .from("exams")
      .insert({ title, subject, topic, difficulty, questions })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Insert returned no data.");
    }

    const payload: PublishExamResponse = {
      id: data.id,
      url: `/test/${data.id}`,
      source: "supabase",
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[exams/publish] Supabase insert failed:", error);
    const id = randomUUID();
    // `source: "simulated"` is a real, load-bearing signal — the caller
    // (ResultsPanel) uses it to warn the admin this ID was never written to
    // Supabase, so the /test/{id} link it hands out is a dead end for
    // students. Silently returning 200-as-if-published here previously left
    // admins with zero indication their exam wasn't actually saved.
    const payload: PublishExamResponse = {
      id,
      url: `/test/${id}`,
      source: "simulated",
    };
    return NextResponse.json(payload);
  }
}
