const GEMINI_MODEL = process.env.AI_MODEL || "gemini-2.5-flash";

/**
 * Thrown when Gemini itself responds with a non-2xx status (rate limits,
 * auth failures, invalid model name, etc.) or returns a shape callers
 * can't use. Carries the upstream HTTP status and Google's own error
 * body untouched, so a caller can surface exactly what Google said
 * instead of masking it behind a generic message.
 */
export class GeminiApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Gemini API error ${status}`);
    this.name = "GeminiApiError";
    this.status = status;
    this.body = body;
  }
}

/** Calls Gemini in JSON-only response mode and returns the parsed payload. Throws GeminiApiError on any failure — callers must not swallow it. */
export async function callGeminiJSON(
  prompt: string,
  apiKey: string,
): Promise<unknown> {
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
    const rawText = await response.text();
    let body: unknown = rawText;
    try {
      body = JSON.parse(rawText);
    } catch {
      // Google didn't return JSON (rare) — keep the raw text as the body.
    }
    throw new GeminiApiError(response.status, body);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new GeminiApiError(502, {
      error: "Gemini response did not contain any text content.",
      raw: data,
    });
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new GeminiApiError(502, {
      error: "Gemini response text was not valid JSON.",
      raw: text,
    });
  }
}
