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

interface TemplateVariant {
  buildPrompt: (topic: string, subject: string) => string;
  buildOptions: (topic: string, subject: string) => string[];
  buildExplanation: (topic: string, subject: string) => string;
}

const EASY_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic, subject) =>
      `Which of the following best defines ${topic} as covered in ${subject}?`,
    buildOptions: (topic, subject) => [
      `${topic} refers to the standard concept taught under ${subject}, governed by its established rules and principles.`,
      `${topic} is an undefined term with no formal basis in ${subject}.`,
      `${topic} only applies to advanced research and has no role in a standard ${subject} curriculum.`,
      `${topic} is unrelated to ${subject} and belongs to a different field of study.`,
    ],
    buildExplanation: (topic, subject) =>
      `${topic} is a core topic within ${subject}, built on clearly defined rules that students are expected to recall and apply. The other options either deny that ${topic} has a formal definition or wrongly separate it from ${subject}, both of which are incorrect at this foundational level.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `${topic} is most closely associated with which of the following in ${subject}?`,
    buildOptions: (topic, subject) => [
      `The fundamental rules and behavior patterns that ${subject} uses to explain ${topic}.`,
      `A set of arbitrary rules with no experimental or logical basis.`,
      `Concepts exclusively borrowed from an unrelated discipline.`,
      `Random observations that cannot be reproduced or tested.`,
    ],
    buildExplanation: (topic, subject) =>
      `In ${subject}, ${topic} is explained using well-established rules and behavior patterns that can be consistently observed and tested — that is what makes it teachable and testable, unlike the other listed options.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `Why is ${topic} typically introduced early when studying ${subject}?`,
    buildOptions: (topic, subject) => [
      `Because it establishes the foundational understanding needed for more advanced topics in ${subject}.`,
      `Because it is the most difficult topic and is reserved for advanced learners only.`,
      `Because it has no real application within ${subject}.`,
      `Because it must be studied only after mastering every other topic in ${subject}.`,
    ],
    buildExplanation: (topic, subject) =>
      `Foundational topics like ${topic} are introduced early precisely because later, more advanced material in ${subject} builds directly on this base understanding.`,
  },
];

const MEDIUM_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic, subject) =>
      `A student is solving a standard ${subject} problem involving ${topic}. Which approach should they apply first?`,
    buildOptions: (topic) => [
      `Identify the specific principles of ${topic} that govern the given scenario before applying any formula.`,
      `Guess an answer and check it against the back of the textbook.`,
      `Apply a formula from an unrelated topic and hope it fits.`,
      `Skip identifying the relevant principle and jump straight to a numerical answer.`,
    ],
    buildExplanation: (topic, subject) =>
      `Correctly applying ${topic} in ${subject} starts with identifying which principle governs the scenario — skipping this step, as the other options suggest, leads to answers that may be numerically close but conceptually wrong.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `Which scenario demonstrates a correct real-world application of ${topic} within ${subject}?`,
    buildOptions: (topic, subject) => [
      `A situation where the behavior described by ${topic} is used to predict or explain an observed outcome in ${subject}.`,
      `A situation where ${topic} is applied despite contradicting every principle of ${subject}.`,
      `A case where the outcome has no relationship to ${topic} at all.`,
      `A case chosen at random with no connection to ${subject}.`,
    ],
    buildExplanation: (topic, subject) =>
      `A correct application of ${topic} always aligns with, and helps explain, real observed outcomes within ${subject} — that consistency is what separates a valid application from an unrelated or contradictory one.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `If two components of a ${subject} problem both relate to ${topic}, what should a student check first?`,
    buildOptions: (topic) => [
      `Whether the two components are consistent with the same underlying principle of ${topic}.`,
      `Whether one of the components can simply be ignored.`,
      `Whether the components belong to a completely different subject.`,
      `Whether the problem can be solved without referencing ${topic} at all.`,
    ],
    buildExplanation: (topic) =>
      `When multiple parts of a problem reference ${topic}, checking that they align with the same underlying principle prevents contradictory reasoning — a common source of error at the medium difficulty level.`,
  },
];

const HARD_VARIANTS: TemplateVariant[] = [
  {
    buildPrompt: (topic, subject) =>
      `In an advanced ${subject} scenario, ${topic} interacts with a secondary variable. Which conclusion is most defensible?`,
    buildOptions: (topic, subject) => [
      `The outcome depends on how ${topic} and the secondary variable jointly satisfy the governing principles of ${subject}.`,
      `The secondary variable can always be ignored regardless of context.`,
      `${topic} alone determines the outcome with no possible external influence.`,
      `The governing principles of ${subject} do not apply once a second variable is introduced.`,
    ],
    buildExplanation: (topic, subject) =>
      `At an advanced level, ${topic} rarely acts in isolation — the most defensible conclusion accounts for how it interacts with other variables while still satisfying the core principles of ${subject}, rather than dismissing either the variable or the principles altogether.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `Which statement best critiques a common misconception students hold about ${topic} in ${subject}?`,
    buildOptions: (topic) => [
      `Students often oversimplify ${topic}, assuming it behaves identically in every context.`,
      `Students correctly assume ${topic} behaves identically in every context, with no exceptions.`,
      `There are no common misconceptions about ${topic} worth addressing.`,
      `${topic} has never been misunderstood by any student.`,
    ],
    buildExplanation: (topic, subject) =>
      `A key sign of advanced understanding is recognizing that ${topic} behaves differently across contexts within ${subject} — the common misconception is treating it as a one-size-fits-all rule rather than a principle with boundary conditions.`,
  },
  {
    buildPrompt: (topic, subject) =>
      `An examiner wants to test deep understanding of ${topic}. Which question type is most appropriate for ${subject}?`,
    buildOptions: (topic) => [
      `A question requiring students to justify why a given outcome follows from the principles of ${topic}.`,
      `A question asking students to simply restate the definition of ${topic} verbatim.`,
      `A question with no connection to any principle of the subject.`,
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

    const correctText = variant.buildOptions(topic, subject)[0];
    const rawOptions = variant.buildOptions(topic, subject);
    const shuffledOptions = shuffleWithRandom(rawOptions, random);
    const correctIndex = shuffledOptions.indexOf(correctText);

    return {
      id: `${params.difficulty}-${index}-${subject}-${topic}`.toLowerCase(),
      questionNumber: index + 1,
      subject,
      topic,
      difficulty: params.difficulty,
      prompt: variant.buildPrompt(topic, subject),
      options: shuffledOptions.map((text, optionIndex) => ({
        label: OPTION_LABELS[optionIndex],
        text,
      })),
      correctLabel: OPTION_LABELS[correctIndex],
      explanation: variant.buildExplanation(topic, subject),
    };
  });
}
