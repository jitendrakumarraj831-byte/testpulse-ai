export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export const GENERATION_STEPS = [
  "Parsing subject & topic context",
  "Drafting question stems",
  "Generating answer choices",
  "Calibrating difficulty & validating correctness",
  "Finalizing exam paper",
] as const;

export type OptionLabel = "A" | "B" | "C" | "D";

const OPTION_LABELS: OptionLabel[] = ["A", "B", "C", "D"];

export interface GeneratedQuestion {
  id: string;
  questionNumber: number;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  prompt: string;
  options: { label: OptionLabel; text: string }[];
  correctLabel: OptionLabel;
  explanation: string;
}

export interface GenerationParams {
  subject: string;
  topic: string;
  totalQuestions: number;
  difficulty: DifficultyLevel;
}

/**
 * Generates purely topic-driven filler content — `subject` is
 * intentionally not a parameter here. It's a background classification
 * label only; mixing it into question/option/explanation text produces
 * nonsensical phrasing like "Rotational Dynamics within General
 * Knowledge" when a teacher pairs an unrelated topic with a subject.
 */
interface TemplateVariant {
  buildPrompt: (topic: string) => string;
  buildOptions: (topic: string) => string[];
  buildExplanation: (topic: string) => string;
}

const EASY_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic) => `Which of the following best defines ${topic}?`,
    buildOptions: (topic) => [
      `${topic} refers to a well-established concept governed by its own clearly defined rules and principles.`,
      `${topic} is an undefined term with no formal, agreed-upon definition.`,
      `${topic} only applies to advanced research and has no role in a standard curriculum.`,
      `${topic} is a purely informal idea with no accepted academic definition.`,
    ],
    buildExplanation: (topic) =>
      `${topic} is a well-defined concept built on clearly established rules that students are expected to recall and apply. The other options either deny that ${topic} has a formal definition or wrongly claim it lacks academic grounding, both of which are incorrect at this foundational level.`,
  },
  {
    buildPrompt: (topic) =>
      `Which of the following is most closely associated with ${topic}?`,
    buildOptions: (topic) => [
      `The fundamental rules and behavior patterns used to explain ${topic}.`,
      `A set of arbitrary rules with no experimental or logical basis.`,
      `Concepts exclusively borrowed from an unrelated discipline.`,
      `Random observations that cannot be reproduced or tested.`,
    ],
    buildExplanation: (topic) =>
      `${topic} is explained using well-established rules and behavior patterns that can be consistently observed and tested — that consistency is what makes it teachable and testable, unlike the other listed options.`,
  },
  {
    buildPrompt: (topic) =>
      `Which statement best explains why ${topic} is considered a foundational concept?`,
    buildOptions: () => [
      `It establishes the basic understanding needed before tackling more advanced related concepts.`,
      `It is the most difficult concept and is reserved for advanced learners only.`,
      `It has no real practical application.`,
      `It must be studied only after mastering every other related concept.`,
    ],
    buildExplanation: (topic) =>
      `Foundational concepts like ${topic} are introduced early precisely because more advanced material builds directly on this base understanding.`,
  },
];

const MEDIUM_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic) =>
      `A student is solving a problem involving ${topic}. Which approach should they apply first?`,
    buildOptions: (topic) => [
      `Identify the specific principles of ${topic} that govern the given scenario before applying any formula.`,
      `Guess an answer and check it against the back of the textbook.`,
      `Apply a formula from an unrelated topic and hope it fits.`,
      `Skip identifying the relevant principle and jump straight to a numerical answer.`,
    ],
    buildExplanation: (topic) =>
      `Correctly applying ${topic} starts with identifying which principle governs the scenario — skipping this step, as the other options suggest, leads to answers that may be numerically close but conceptually wrong.`,
  },
  {
    buildPrompt: (topic) =>
      `Which scenario demonstrates a correct real-world application of ${topic}?`,
    buildOptions: (topic) => [
      `A situation where the behavior described by ${topic} is used to predict or explain an observed outcome.`,
      `A situation where ${topic} is applied despite contradicting its own governing principles.`,
      `A case where the outcome has no relationship to ${topic} at all.`,
      `A case chosen at random with no connection to ${topic}.`,
    ],
    buildExplanation: (topic) =>
      `A correct application of ${topic} always aligns with, and helps explain, real observed outcomes — that consistency is what separates a valid application from an unrelated or contradictory one.`,
  },
  {
    buildPrompt: (topic) =>
      `If two parts of a problem both relate to ${topic}, what should a student check first?`,
    buildOptions: (topic) => [
      `Whether the two parts are consistent with the same underlying principle of ${topic}.`,
      `Whether one of the parts can simply be ignored.`,
      `Whether the parts belong to two entirely unrelated concepts.`,
      `Whether the problem can be solved without referencing ${topic} at all.`,
    ],
    buildExplanation: (topic) =>
      `When multiple parts of a problem reference ${topic}, checking that they align with the same underlying principle prevents contradictory reasoning — a common source of error at the medium difficulty level.`,
  },
];

const HARD_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic) =>
      `In an advanced scenario, ${topic} interacts with a secondary variable. Which conclusion is most defensible?`,
    buildOptions: (topic) => [
      `The outcome depends on how ${topic} and the secondary variable jointly satisfy its governing principles.`,
      `The secondary variable can always be ignored regardless of context.`,
      `${topic} alone determines the outcome with no possible external influence.`,
      `The governing principles of ${topic} do not apply once a second variable is introduced.`,
    ],
    buildExplanation: (topic) =>
      `At an advanced level, ${topic} rarely acts in isolation — the most defensible conclusion accounts for how it interacts with other variables while still satisfying its own core principles, rather than dismissing either the variable or the principles altogether.`,
  },
  {
    buildPrompt: (topic) =>
      `Which statement best critiques a common misconception students hold about ${topic}?`,
    buildOptions: (topic) => [
      `Students often oversimplify ${topic}, assuming it behaves identically in every context.`,
      `Students correctly assume ${topic} behaves identically in every context, with no exceptions.`,
      `There are no common misconceptions about ${topic} worth addressing.`,
      `${topic} has never been misunderstood by any student.`,
    ],
    buildExplanation: (topic) =>
      `A key sign of advanced understanding is recognizing that ${topic} behaves differently across contexts — the common misconception is treating it as a one-size-fits-all rule rather than a principle with boundary conditions.`,
  },
  {
    buildPrompt: (topic) =>
      `An examiner wants to test deep understanding of ${topic}. Which question type is most appropriate?`,
    buildOptions: (topic) => [
      `A question requiring students to justify why a given outcome follows from the principles of ${topic}.`,
      `A question asking students to simply restate the definition of ${topic} verbatim.`,
      `A question with no connection to any principle of ${topic}.`,
      `A question that can be answered correctly by guessing without reading about ${topic} at all.`,
    ],
    buildExplanation: (topic) =>
      `Deep understanding of ${topic} is best tested by requiring justification — explaining why an outcome follows from principles — rather than rote recall, which only confirms memorization rather than comprehension.`,
  },
];

const VARIANTS_BY_DIFFICULTY: Record<DifficultyLevel, TemplateVariant[]> = {
  Easy: EASY_VARIANTS,
  Medium: MEDIUM_VARIANTS,
  Hard: HARD_VARIANTS,
};

/** Deterministic PRNG (mulberry32) so the same batch reshuffles identically across renders. */
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function shuffleWithRandom<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Flat question shape returned by the `/api/generate-questions` route. */
export interface ApiQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: OptionLabel;
  explanation: string;
}

export interface GenerateQuestionsResponse {
  questions: ApiQuestion[];
  source: "ai" | "mock";
}

export interface GenerateQuestionsRequestBody {
  subject: string;
  topic: string;
  count: number;
  difficulty: DifficultyLevel;
}

/** Request body accepted by `/api/exams/publish`. */
export interface PublishExamRequestBody {
  title?: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  questions: ApiQuestion[];
}

export interface PublishExamResponse {
  id: string;
  url: string;
  source: "supabase" | "simulated";
}

/** Runtime shape check for a single flat API question. */
export function isApiQuestion(value: unknown): value is ApiQuestion {
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

/** Adapts the UI's richer GeneratedQuestion shape back into a flat API question. */
export function mapGeneratedToApiQuestion(
  question: GeneratedQuestion,
): ApiQuestion {
  return {
    id: question.questionNumber,
    question: question.prompt,
    options: question.options.map((option) => option.text),
    correctAnswer: question.correctLabel,
    explanation: question.explanation,
  };
}

/** Adapts a flat API question into the UI's richer GeneratedQuestion shape. */
export function mapApiQuestionToGenerated(
  question: ApiQuestion,
  context: { subject: string; topic: string; difficulty: DifficultyLevel },
): GeneratedQuestion {
  return {
    id: `${context.difficulty}-${question.id}-${context.subject}-${context.topic}`.toLowerCase(),
    questionNumber: question.id,
    subject: context.subject,
    topic: context.topic,
    difficulty: context.difficulty,
    prompt: question.question,
    options: question.options.map((text, index) => ({
      label: OPTION_LABELS[index],
      text,
    })),
    correctLabel: question.correctAnswer,
    explanation: question.explanation,
  };
}

export function generateMockQuestions(
  params: GenerationParams,
): GeneratedQuestion[] {
  const subject = params.subject.trim();
  const topic = params.topic.trim();
  const variants = VARIANTS_BY_DIFFICULTY[params.difficulty];

  return Array.from({ length: params.totalQuestions }, (_, index) => {
    const variant = variants[index % variants.length];
    const random = createSeededRandom(
      hashString(`${subject}|${topic}|${params.difficulty}|${index}`),
    );

    const correctText = variant.buildOptions(topic)[0];
    const rawOptions = variant.buildOptions(topic);
    const shuffledOptions = shuffleWithRandom(rawOptions, random);
    const correctIndex = shuffledOptions.indexOf(correctText);

    return {
      id: `${params.difficulty}-${index}-${subject}-${topic}`.toLowerCase(),
      questionNumber: index + 1,
      subject,
      topic,
      difficulty: params.difficulty,
      prompt: variant.buildPrompt(topic),
      options: shuffledOptions.map((text, optionIndex) => ({
        label: OPTION_LABELS[optionIndex],
        text,
      })),
      correctLabel: OPTION_LABELS[correctIndex],
      explanation: variant.buildExplanation(topic),
    };
  });
}
