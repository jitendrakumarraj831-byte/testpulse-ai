import Groq from "groq-sdk";

const GROQ_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

/** Calls Groq in JSON-only response mode and returns the parsed payload. Throws on any failure. */
export async function callGroqJSON(
  prompt: string,
  apiKey: string,
): Promise<unknown> {
  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("Groq response did not contain any text content");
  }

  return JSON.parse(text);
}
