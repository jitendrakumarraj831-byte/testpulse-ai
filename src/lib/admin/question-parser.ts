import type { ApiQuestion, OptionLabel } from "@/lib/admin/question-generator";

const OPTION_LABELS: OptionLabel[] = ["A", "B", "C", "D"];

/** One row in the upload preview/validation table, regardless of source (file or pasted text). */
export interface ParsedQuestionRow {
  rowId: string;
  question: string;
  options: string[];
  correctAnswer: OptionLabel | null;
  explanation: string;
  subject: string;
  topic: string;
  isValid: boolean;
  issues: string[];
}

const HEADER_ALIASES: Record<string, string> = {
  question: "question",
  "question text": "question",
  q: "question",
  optiona: "optionA",
  "option a": "optionA",
  a: "optionA",
  optionb: "optionB",
  "option b": "optionB",
  b: "optionB",
  optionc: "optionC",
  "option c": "optionC",
  c: "optionC",
  optiond: "optionD",
  "option d": "optionD",
  d: "optionD",
  correctanswer: "correctAnswer",
  "correct answer": "correctAnswer",
  answer: "correctAnswer",
  correct: "correctAnswer",
  explanation: "explanation",
  reason: "explanation",
  subject: "subject",
  topic: "topic",
  chapter: "topic",
};

function normalizeRowKeys(row: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [rawKey, value] of Object.entries(row)) {
    const key = HEADER_ALIASES[rawKey.trim().toLowerCase()];
    if (key && value !== undefined && value !== null) {
      normalized[key] = String(value).trim();
    }
  }
  return normalized;
}

function resolveCorrectAnswer(
  raw: string | undefined,
  options: string[],
): OptionLabel | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();

  if ((OPTION_LABELS as string[]).includes(upper)) {
    return upper as OptionLabel;
  }

  const numeric = Number(trimmed);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) {
    return OPTION_LABELS[numeric - 1];
  }

  const matchIndex = options.findIndex(
    (option) => option.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (matchIndex !== -1) return OPTION_LABELS[matchIndex];

  return null;
}

/** Converts flexible-header spreadsheet rows (from CSV or XLSX) into validated preview rows. */
export function rowsToParsedQuestions(
  rows: Record<string, unknown>[],
  defaults: { subject: string; topic: string },
): ParsedQuestionRow[] {
  return rows.map((row, index) => {
    const normalized = normalizeRowKeys(row);
    const options = [
      normalized.optionA ?? "",
      normalized.optionB ?? "",
      normalized.optionC ?? "",
      normalized.optionD ?? "",
    ];
    const question = normalized.question ?? "";
    const correctAnswer = resolveCorrectAnswer(normalized.correctAnswer, options);

    const issues: string[] = [];
    if (!question) issues.push("Missing question text");
    options.forEach((option, optionIndex) => {
      if (!option) issues.push(`Missing option ${OPTION_LABELS[optionIndex]}`);
    });
    if (!correctAnswer) issues.push("Could not determine the correct answer");

    return {
      rowId: `file-row-${index}`,
      question,
      options,
      correctAnswer,
      explanation: normalized.explanation ?? "",
      subject: normalized.subject || defaults.subject,
      topic: normalized.topic || defaults.topic,
      isValid: issues.length === 0,
      issues,
    };
  });
}

/** Parses a CSV string into header-keyed row objects (handles quoted fields with embedded commas/newlines). */
export function parseCsvText(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  const [headerRow, ...dataRows] = nonEmptyRows;
  if (!headerRow) return [];

  return dataRows.map((dataRow) => {
    const record: Record<string, unknown> = {};
    headerRow.forEach((header, index) => {
      record[header.trim()] = dataRow[index] ?? "";
    });
    return record;
  });
}

/**
 * Best-effort regex fallback for parsing raw "plain paper" text into questions
 * when the AI parser is unavailable. Expects roughly:
 *   1. Question text...
 *   A) Option one
 *   B) Option two
 *   C) Option three
 *   D) Option four
 *   Answer: B
 */
export function heuristicParseRawText(rawText: string): ApiQuestion[] {
  const lines = rawText.split(/\r?\n/);
  const questionStart = /^(\d+)[.)]\s*(.*)$/;
  const optionLine = /^([A-Da-d])[.)]\s*(.*)$/;
  const answerLine = /^(?:answer|correct|ans)\s*[:\-]?\s*([A-Da-d])\b/i;
  const explanationLine = /^explanation\s*[:\-]?\s*(.*)$/i;

  interface Block {
    question: string;
    options: string[];
    correctAnswer: OptionLabel | null;
    explanation: string;
  }

  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const qMatch = line.match(questionStart);
    const oMatch = line.match(optionLine);
    const aMatch = line.match(answerLine);
    const eMatch = line.match(explanationLine);

    if (qMatch) {
      if (current) blocks.push(current);
      current = { question: qMatch[2].trim(), options: [], correctAnswer: null, explanation: "" };
    } else if (oMatch && current && current.options.length < 4) {
      current.options.push(oMatch[2].trim());
    } else if (aMatch && current) {
      current.correctAnswer = aMatch[1].toUpperCase() as OptionLabel;
    } else if (eMatch && current) {
      current.explanation = eMatch[1].trim();
    } else if (current && current.options.length === 0) {
      current.question += ` ${line}`;
    }
  }
  if (current) blocks.push(current);

  return blocks
    .filter((block) => block.question && block.options.length === 4)
    .map((block, index) => ({
      id: index + 1,
      question: block.question,
      options: block.options,
      correctAnswer: block.correctAnswer ?? "A",
      explanation:
        block.explanation ||
        "Best-effort extraction — no AI configured, please verify this answer.",
    }));
}
