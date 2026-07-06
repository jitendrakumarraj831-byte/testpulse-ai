export type OptionLabel = "A" | "B" | "C" | "D";

export interface ExamQuestion {
  id: number;
  subject: string;
  topic: string;
  prompt: string;
  options: { label: OptionLabel; text: string }[];
}

export const EXAM_DURATION_SECONDS = 60 * 60;

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    subject: "Physics",
    topic: "Rotational Dynamics",
    prompt:
      "A solid sphere and a hollow sphere of the same mass and radius are released from rest at the same height and roll down an incline without slipping. Which one reaches the bottom first?",
    options: [
      { label: "A", text: "The solid sphere, since it has a smaller moment of inertia coefficient." },
      { label: "B", text: "The hollow sphere, since it has a larger moment of inertia coefficient." },
      { label: "C", text: "Both reach the bottom at exactly the same time." },
      { label: "D", text: "It depends on the angle of the incline." },
    ],
  },
  {
    id: 2,
    subject: "Physics",
    topic: "Laws of Motion",
    prompt:
      "A block of mass m rests on a frictionless incline of angle θ and is held stationary by a string running parallel to the incline surface. What is the tension in the string?",
    options: [
      { label: "A", text: "mg sin θ" },
      { label: "B", text: "mg cos θ" },
      { label: "C", text: "mg tan θ" },
      { label: "D", text: "mg" },
    ],
  },
  {
    id: 3,
    subject: "Physics",
    topic: "Thermodynamics",
    prompt:
      "For a reversible adiabatic process undergone by an ideal gas, which of the following relations correctly holds throughout the process?",
    options: [
      { label: "A", text: "PV = constant" },
      { label: "B", text: "PVᵞ = constant" },
      { label: "C", text: "V/T = constant" },
      { label: "D", text: "P/T = constant" },
    ],
  },
  {
    id: 4,
    subject: "Physics",
    topic: "Electrostatics",
    prompt:
      "An electric dipole consists of charges +q and −q separated by a distance d. How does the electric field at a point on the equatorial line, at a large distance r from the dipole, vary with r?",
    options: [
      { label: "A", text: "It is proportional to 1/r³" },
      { label: "B", text: "It is proportional to 1/r²" },
      { label: "C", text: "It is proportional to 1/r" },
      { label: "D", text: "It is proportional to 1/r⁴" },
    ],
  },
  {
    id: 5,
    subject: "Physics",
    topic: "Current Electricity",
    prompt:
      "Two identical resistors, each of resistance R, are connected first in series and then in parallel across the same ideal battery. What is the ratio of power dissipated in the series combination to the parallel combination?",
    options: [
      { label: "A", text: "1 : 4" },
      { label: "B", text: "4 : 1" },
      { label: "C", text: "1 : 2" },
      { label: "D", text: "2 : 1" },
    ],
  },
  {
    id: 6,
    subject: "Physics",
    topic: "Magnetic Effects of Current",
    prompt:
      "A straight current-carrying conductor is placed in a uniform magnetic field such that the current direction is parallel to the field. What is the magnetic force experienced by the conductor?",
    options: [
      { label: "A", text: "Zero" },
      { label: "B", text: "Maximum, equal to BIL" },
      { label: "C", text: "Equal to BIL, directed perpendicular to the conductor" },
      { label: "D", text: "Non-zero, but only along the length of the conductor" },
    ],
  },
  {
    id: 7,
    subject: "Physics",
    topic: "Ray Optics",
    prompt:
      "A convex lens forms a real, inverted image that is exactly the same size as the object. At what distance from the lens is the object placed, in terms of its focal length f?",
    options: [
      { label: "A", text: "At a distance of 2f" },
      { label: "B", text: "At a distance of f" },
      { label: "C", text: "At a distance of f/2" },
      { label: "D", text: "At infinity" },
    ],
  },
  {
    id: 8,
    subject: "Physics",
    topic: "Modern Physics",
    prompt:
      "In the photoelectric effect, if the frequency of incident light is kept above the threshold frequency and its intensity is increased, what primarily increases?",
    options: [
      { label: "A", text: "The number of photoelectrons emitted per second" },
      { label: "B", text: "The maximum kinetic energy of the emitted photoelectrons" },
      { label: "C", text: "The threshold frequency of the metal surface" },
      { label: "D", text: "The work function of the metal" },
    ],
  },
  {
    id: 9,
    subject: "Physics",
    topic: "Waves & Oscillations",
    prompt:
      "Two tuning forks of frequencies 256 Hz and 260 Hz are sounded together. What beat frequency is heard by an observer?",
    options: [
      { label: "A", text: "4 Hz" },
      { label: "B", text: "258 Hz" },
      { label: "C", text: "516 Hz" },
      { label: "D", text: "2 Hz" },
    ],
  },
  {
    id: 10,
    subject: "Physics",
    topic: "Gravitation",
    prompt:
      "A satellite moves in a circular orbit around Earth. If the orbital radius is doubled, how does the orbital period change according to Kepler's third law (T² ∝ r³)?",
    options: [
      { label: "A", text: "It increases by a factor of 2√2" },
      { label: "B", text: "It increases by a factor of 2" },
      { label: "C", text: "It increases by a factor of 4" },
      { label: "D", text: "It remains unchanged" },
    ],
  },
  {
    id: 11,
    subject: "Physics",
    topic: "Fluid Mechanics",
    prompt:
      "According to Bernoulli's principle, as the speed of an ideal fluid increases while flowing through a horizontal pipe of varying cross-section, the pressure at that point:",
    options: [
      { label: "A", text: "Decreases" },
      { label: "B", text: "Increases" },
      { label: "C", text: "Remains constant" },
      { label: "D", text: "Drops to zero" },
    ],
  },
  {
    id: 12,
    subject: "Physics",
    topic: "Simple Harmonic Motion",
    prompt:
      "For a particle executing simple harmonic motion, which statement correctly describes its velocity and acceleration at the mean position?",
    options: [
      { label: "A", text: "Velocity is maximum and acceleration is zero" },
      { label: "B", text: "Velocity is zero and acceleration is maximum" },
      { label: "C", text: "Both velocity and acceleration are zero" },
      { label: "D", text: "Both velocity and acceleration are maximum" },
    ],
  },
  {
    id: 13,
    subject: "Physics",
    topic: "Electromagnetic Induction",
    prompt:
      "A bar magnet is pushed quickly towards a stationary coil connected to a galvanometer. According to Lenz's law, the induced current flows in a direction that:",
    options: [
      { label: "A", text: "Opposes the change in magnetic flux that produced it" },
      { label: "B", text: "Aids the motion of the magnet towards the coil" },
      { label: "C", text: "Has no defined relationship with the magnet's motion" },
      { label: "D", text: "Flows only after the magnet has stopped moving" },
    ],
  },
  {
    id: 14,
    subject: "Physics",
    topic: "Semiconductor Electronics",
    prompt:
      "In a p-n junction diode under forward bias, what happens to the width of the depletion region?",
    options: [
      { label: "A", text: "It decreases" },
      { label: "B", text: "It increases" },
      { label: "C", text: "It remains unchanged" },
      { label: "D", text: "It becomes infinitely wide" },
    ],
  },
  {
    id: 15,
    subject: "Physics",
    topic: "Units, Dimensions & Errors",
    prompt:
      "If the percentage error in measuring the radius of a sphere is 2%, what is the resulting percentage error in its calculated volume (V ∝ r³)?",
    options: [
      { label: "A", text: "6%" },
      { label: "B", text: "2%" },
      { label: "C", text: "3%" },
      { label: "D", text: "8%" },
    ],
  },
];

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatTestTitle(testId: string): string {
  const cleaned = toTitleCase(testId.replace(/[-_]+/g, " ").trim());
  if (!cleaned) return "Mock Exam";
  return /exam|test/i.test(cleaned) ? cleaned : `${cleaned} Mock Exam`;
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
