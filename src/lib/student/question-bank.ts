import type { ApiQuestion } from "@/lib/admin/question-generator";

/**
 * One fixed, curated question bank per subject slug. Every exam under a
 * subject draws from this same array, so a student can never see another
 * subject's questions regardless of which exam card they open.
 */
export const QUESTION_BANK: Record<string, ApiQuestion[]> = {
  science: [
    {
      id: 1,
      question:
        "A body moving in a circle at constant speed is accelerating because its ______ is constantly changing.",
      options: ["direction", "speed", "mass", "time period"],
      correctAnswer: "A",
      explanation:
        "Centripetal acceleration arises from the continuous change in the direction of velocity, even when speed is constant.",
    },
    {
      id: 2,
      question:
        "Newton's Third Law states that for every action there is an equal and opposite ______.",
      options: ["reaction", "force multiplier", "momentum loss", "acceleration"],
      correctAnswer: "A",
      explanation:
        "Newton's Third Law: for every action force, there is an equal and opposite reaction force acting on the other body.",
    },
    {
      id: 3,
      question: "The SI unit of force is the:",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctAnswer: "B",
      explanation:
        "Force is measured in Newtons (N), defined as the force needed to accelerate 1 kg at 1 m/s².",
    },
    {
      id: 4,
      question:
        "A concave mirror always forms a virtual, erect image when the object is placed:",
      options: [
        "between the pole and the focus",
        "at the center of curvature",
        "beyond the center of curvature",
        "at infinity",
      ],
      correctAnswer: "A",
      explanation:
        "When the object lies between the pole and focus of a concave mirror, the reflected rays diverge, producing a virtual, erect, magnified image.",
    },
    {
      id: 5,
      question:
        "Refractive index of a medium is defined as the ratio of the speed of light in:",
      options: ["vacuum to the medium", "the medium to vacuum", "water to air", "air to water"],
      correctAnswer: "A",
      explanation: "Refractive index n = c / v, the speed of light in vacuum divided by its speed in the medium.",
    },
    {
      id: 6,
      question: "The First Law of Thermodynamics is a statement of conservation of:",
      options: ["momentum", "energy", "mass only", "entropy"],
      correctAnswer: "B",
      explanation:
        "The First Law states that energy cannot be created or destroyed, only converted between heat, work, and internal energy.",
    },
    {
      id: 7,
      question: "The Zeroth Law of Thermodynamics is the basis for the concept of:",
      options: ["entropy", "temperature", "pressure", "enthalpy"],
      correctAnswer: "B",
      explanation:
        "The Zeroth Law establishes that if two systems are each in thermal equilibrium with a third, they are in equilibrium with each other, which underpins the definition of temperature.",
    },
    {
      id: 8,
      question:
        "The ideal gas equation PV = nRT relates pressure, volume, and:",
      options: ["density and mass", "temperature and moles", "viscosity", "surface tension"],
      correctAnswer: "B",
      explanation:
        "The ideal gas law connects pressure, volume, number of moles (n), and absolute temperature (T) via the gas constant R.",
    },
    {
      id: 9,
      question: "The atomic number of an element represents the number of:",
      options: [
        "neutrons in the nucleus",
        "protons in the nucleus",
        "electrons in the outer shell only",
        "neutrons plus protons",
      ],
      correctAnswer: "B",
      explanation:
        "Atomic number (Z) is defined as the number of protons in an atom's nucleus, which determines the element's identity.",
    },
    {
      id: 10,
      question: "Pure water at 25°C has a pH value of:",
      options: ["0", "7", "14", "10"],
      correctAnswer: "B",
      explanation: "Pure water is neutral, with a pH of 7 at 25°C.",
    },
    {
      id: 11,
      question:
        "Avogadro's number, approximately 6.022 × 10²³, represents the number of particles in one:",
      options: ["gram", "litre", "mole", "atom"],
      correctAnswer: "C",
      explanation: "Avogadro's number defines the number of constituent particles in exactly one mole of a substance.",
    },
    {
      id: 12,
      question: "Elements in the same group of the periodic table have the same number of:",
      options: ["neutrons", "valence electrons", "isotopes", "energy levels"],
      correctAnswer: "B",
      explanation:
        "Elements in a group share the same number of valence electrons, giving them similar chemical properties.",
    },
    {
      id: 13,
      question: "Newton's Second Law of Motion is expressed as:",
      options: ["F = ma", "E = mc²", "F = mv", "P = IV"],
      correctAnswer: "A",
      explanation: "Newton's Second Law states that force equals mass times acceleration (F = ma).",
    },
    {
      id: 14,
      question:
        "The Work-Energy Theorem states that the net work done on an object equals its change in:",
      options: ["momentum", "kinetic energy", "potential energy only", "temperature"],
      correctAnswer: "B",
      explanation:
        "The Work-Energy Theorem states that the net work done on an object equals the change in its kinetic energy.",
    },
    {
      id: 15,
      question: "Light travels fastest when passing through:",
      options: ["glass", "water", "vacuum", "air"],
      correctAnswer: "C",
      explanation: "Light travels at its maximum speed (~3 × 10⁸ m/s) in a vacuum, slowing down in denser media.",
    },
  ],

  mathematics: [
    {
      id: 1,
      question: "For a function f(x) = xⁿ, the derivative f'(x) is:",
      options: ["n·xⁿ⁻¹", "xⁿ⁺¹ / (n+1)", "n·xⁿ", "xⁿ⁻¹"],
      correctAnswer: "A",
      explanation: "The power rule states that the derivative of xⁿ is n·xⁿ⁻¹.",
    },
    {
      id: 2,
      question: "The integral ∫(1/x) dx equals:",
      options: ["x² / 2 + C", "ln|x| + C", "1/x² + C", "eˣ + C"],
      correctAnswer: "B",
      explanation: "The antiderivative of 1/x is the natural logarithm, ln|x| + C.",
    },
    {
      id: 3,
      question: "The roots of ax² + bx + c = 0 are given by the formula x =",
      options: [
        "(-b ± √(b²-4ac)) / 2a",
        "(-b ± √(b²+4ac)) / 2a",
        "(b ± √(b²-4ac)) / a",
        "(-b² ± 4ac) / 2a",
      ],
      correctAnswer: "A",
      explanation: "This is the standard quadratic formula derived by completing the square.",
    },
    {
      id: 4,
      question:
        "For a 2×2 matrix [[a, b], [c, d]], the determinant is calculated as:",
      options: ["ac - bd", "ad - bc", "ab - cd", "ad + bc"],
      correctAnswer: "B",
      explanation: "The determinant of a 2×2 matrix is the product of the main diagonal minus the product of the anti-diagonal: ad - bc.",
    },
    {
      id: 5,
      question: "Multiplying any matrix A by the identity matrix I gives:",
      options: ["the zero matrix", "the inverse of A", "A itself", "the transpose of A"],
      correctAnswer: "C",
      explanation: "The identity matrix acts as the multiplicative identity, so A × I = A.",
    },
    {
      id: 6,
      question:
        "If two events A and B are independent, the probability that both occur is:",
      options: ["P(A) + P(B)", "P(A) - P(B)", "P(A) × P(B)", "P(A) / P(B)"],
      correctAnswer: "C",
      explanation: "For independent events, the joint probability is the product of their individual probabilities.",
    },
    {
      id: 7,
      question:
        "The sum of the probabilities of all possible outcomes in a sample space equals:",
      options: ["0", "0.5", "1", "it depends on the number of outcomes"],
      correctAnswer: "C",
      explanation: "By definition, probabilities across a complete sample space always sum to 1.",
    },
    {
      id: 8,
      question: "The derivative of sin(x) with respect to x is:",
      options: ["-cos(x)", "cos(x)", "-sin(x)", "tan(x)"],
      correctAnswer: "B",
      explanation: "d/dx[sin(x)] = cos(x), a standard trigonometric derivative.",
    },
    {
      id: 9,
      question:
        "The number of ways to choose r items from n items, where order does not matter, is given by:",
      options: ["nPr", "n!", "nCr", "n / r"],
      correctAnswer: "C",
      explanation: "Combinations (nCr) count selections where order doesn't matter, unlike permutations (nPr).",
    },
    {
      id: 10,
      question: "Two matrices A and B can be multiplied (AB) only if:",
      options: [
        "they have the same number of rows",
        "the number of columns of A equals the number of rows of B",
        "both are square matrices",
        "their determinants are equal",
      ],
      correctAnswer: "B",
      explanation: "Matrix multiplication AB is defined only when A's column count matches B's row count.",
    },
    {
      id: 11,
      question:
        "The derivative of a function f at point x is formally defined as the limit of [f(x+h) - f(x)] / h as h approaches:",
      options: ["infinity", "1", "0", "x"],
      correctAnswer: "C",
      explanation: "The derivative is defined as this difference quotient's limit as h approaches 0.",
    },
    {
      id: 12,
      question:
        "In an arithmetic progression with first term a and common difference d, the nth term is:",
      options: ["a + (n-1)d", "a·dⁿ⁻¹", "a + nd", "a - (n-1)d"],
      correctAnswer: "A",
      explanation: "The nth term of an AP is given by a + (n-1)d.",
    },
    {
      id: 13,
      question: "For any base a > 0 (a ≠ 1), the value of log_a(a) is:",
      options: ["0", "a", "1", "undefined"],
      correctAnswer: "C",
      explanation: "Any number's logarithm to its own base equals 1, since a¹ = a.",
    },
    {
      id: 14,
      question: "The imaginary unit i satisfies i² equals:",
      options: ["1", "-1", "i", "0"],
      correctAnswer: "B",
      explanation: "By definition, the imaginary unit i is the square root of -1, so i² = -1.",
    },
    {
      id: 15,
      question: "The probability of an impossible event is:",
      options: ["1", "0.5", "undefined", "0"],
      correctAnswer: "D",
      explanation: "An impossible event has zero probability of occurring.",
    },
  ],

  "general-knowledge": [
    {
      id: 1,
      question: "Who is widely known as the 'Father of the Nation' in India?",
      options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Sardar Patel", "Subhas Chandra Bose"],
      correctAnswer: "B",
      explanation: "Mahatma Gandhi is honored as the Father of the Nation for leading India's non-violent independence movement.",
    },
    {
      id: 2,
      question: "The Constitution of India came into effect on:",
      options: ["15 August 1947", "26 November 1949", "26 January 1950", "2 October 1950"],
      correctAnswer: "C",
      explanation: "The Constitution was adopted on 26 November 1949 but came into force on 26 January 1950, celebrated as Republic Day.",
    },
    {
      id: 3,
      question: "Which is the longest river in India?",
      options: ["Yamuna", "Godavari", "Ganga", "Brahmaputra"],
      correctAnswer: "C",
      explanation: "The Ganga is India's longest river, flowing over 2,500 km through northern India.",
    },
    {
      id: 4,
      question: "Who was the first Prime Minister of independent India?",
      options: ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Lal Bahadur Shastri", "Sardar Vallabhbhai Patel"],
      correctAnswer: "B",
      explanation: "Jawaharlal Nehru served as India's first Prime Minister, from 1947 until his death in 1964.",
    },
    {
      id: 5,
      question: "Which article of the Indian Constitution guarantees the Right to Equality?",
      options: ["Article 14", "Article 21", "Article 32", "Article 370"],
      correctAnswer: "A",
      explanation: "Article 14 guarantees equality before the law and equal protection of the laws to all citizens.",
    },
    {
      id: 6,
      question: "Which is the largest Indian state by area?",
      options: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"],
      correctAnswer: "C",
      explanation: "Rajasthan is India's largest state by geographical area.",
    },
    {
      id: 7,
      question: "The Quit India Movement was launched in the year:",
      options: ["1930", "1942", "1947", "1920"],
      correctAnswer: "B",
      explanation: "The Quit India Movement was launched by Mahatma Gandhi in August 1942, demanding an end to British rule.",
    },
    {
      id: 8,
      question: "Who wrote India's National Anthem, 'Jana Gana Mana'?",
      options: ["Bankim Chandra Chatterjee", "Sarojini Naidu", "Rabindranath Tagore", "Muhammad Iqbal"],
      correctAnswer: "C",
      explanation: "Rabindranath Tagore composed 'Jana Gana Mana', adopted as India's National Anthem in 1950.",
    },
    {
      id: 9,
      question:
        "The Indian Constitution is often described as the ______ written constitution in the world.",
      options: ["shortest", "oldest", "longest", "simplest"],
      correctAnswer: "C",
      explanation: "With hundreds of articles and schedules, the Indian Constitution is the longest written constitution of any sovereign country.",
    },
    {
      id: 10,
      question: "The Taj Mahal was built by the Mughal emperor:",
      options: ["Akbar", "Shah Jahan", "Aurangzeb", "Humayun"],
      correctAnswer: "B",
      explanation: "Emperor Shah Jahan commissioned the Taj Mahal in memory of his wife, Mumtaz Mahal.",
    },
    {
      id: 11,
      question: "India's highest civilian award is the:",
      options: ["Padma Vibhushan", "Ashoka Chakra", "Bharat Ratna", "Param Vir Chakra"],
      correctAnswer: "C",
      explanation: "The Bharat Ratna is India's highest civilian award, recognizing exceptional service to the nation.",
    },
    {
      id: 12,
      question:
        "According to the Preamble, India is declared a Sovereign, Socialist, Secular, Democratic:",
      options: ["Federation", "Republic", "Union", "Monarchy"],
      correctAnswer: "B",
      explanation: "The Preamble declares India a Sovereign, Socialist, Secular, Democratic Republic.",
    },
    {
      id: 13,
      question: "Who was the first President of India?",
      options: ["Dr. Rajendra Prasad", "Dr. S. Radhakrishnan", "Zakir Husain", "V. V. Giri"],
      correctAnswer: "A",
      explanation: "Dr. Rajendra Prasad served as India's first President, from 1950 to 1962.",
    },
    {
      id: 14,
      question: "Which Indian state has the longest coastline?",
      options: ["Tamil Nadu", "Gujarat", "Kerala", "Andhra Pradesh"],
      correctAnswer: "B",
      explanation: "Gujarat has the longest coastline among Indian states, stretching along the Arabian Sea.",
    },
    {
      id: 15,
      question: "The minimum age to be eligible to vote in Indian elections is:",
      options: ["21", "16", "18", "25"],
      correctAnswer: "C",
      explanation: "The voting age in India was lowered from 21 to 18 by the 61st Constitutional Amendment in 1988.",
    },
  ],

  "current-affairs": [
    {
      id: 1,
      question:
        "Besides Physics, Chemistry, Medicine, Literature, and Peace, the sixth Nobel Prize category is:",
      options: ["Mathematics", "Economic Sciences", "Technology", "Environmental Science"],
      correctAnswer: "B",
      explanation: "The Sveriges Riksbank Prize in Economic Sciences is awarded alongside the five original Nobel Prizes.",
    },
    {
      id: 2,
      question: "The Summer Olympic Games are held every:",
      options: ["2 years", "3 years", "4 years", "5 years"],
      correctAnswer: "C",
      explanation: "The Summer Olympics follow a four-year cycle, known as an Olympiad.",
    },
    {
      id: 3,
      question: "The 2024 Summer Olympics were hosted by which city?",
      options: ["Tokyo", "Los Angeles", "Paris", "London"],
      correctAnswer: "C",
      explanation: "Paris hosted the 2024 Summer Olympics, its first time since 1924.",
    },
    {
      id: 4,
      question: "The FIFA World Cup is held every:",
      options: ["2 years", "3 years", "4 years", "6 years"],
      correctAnswer: "C",
      explanation: "The FIFA World Cup has traditionally been held every four years since 1930.",
    },
    {
      id: 5,
      question: "ChatGPT, a widely used conversational AI assistant, was developed by:",
      options: ["Google", "OpenAI", "Meta", "Amazon"],
      correctAnswer: "B",
      explanation: "ChatGPT was developed and released by OpenAI.",
    },
    {
      id: 6,
      question: "The Grammy Awards primarily honor outstanding achievement in the field of:",
      options: ["Film", "Literature", "Music", "Sports"],
      correctAnswer: "C",
      explanation: "The Grammy Awards, presented by the Recording Academy, recognize excellence in the music industry.",
    },
    {
      id: 7,
      question: "The Booker Prize is a prestigious award given for excellence in:",
      options: ["Fiction writing", "Scientific research", "Film direction", "Architecture"],
      correctAnswer: "A",
      explanation: "The Booker Prize is awarded annually for the best original novel written in English.",
    },
    {
      id: 8,
      question: "Wimbledon, one of tennis's Grand Slam tournaments, is held annually in:",
      options: ["France", "the United States", "England", "Australia"],
      correctAnswer: "C",
      explanation: "Wimbledon is held each year in London, England, and is the oldest tennis tournament in the world.",
    },
    {
      id: 9,
      question: "The G20 forum brings together major economies primarily to discuss:",
      options: ["Global economic cooperation", "Space exploration", "Sports diplomacy", "Literary exchange"],
      correctAnswer: "A",
      explanation: "The G20 is an international forum for cooperation on global economic stability and policy.",
    },
    {
      id: 10,
      question: "The headquarters of the United Nations is located in:",
      options: ["Geneva", "New York City", "Brussels", "Vienna"],
      correctAnswer: "B",
      explanation: "The UN's main headquarters is located in New York City, though it has other major offices worldwide.",
    },
    {
      id: 11,
      question:
        "The 'Transformer' architecture, which underlies most modern large language models, was introduced in a paper titled:",
      options: ["'Attention Is All You Need'", "'Deep Learning Basics'", "'The Future of AI'", "'Neural Networks Explained'"],
      correctAnswer: "A",
      explanation: "The 2017 paper 'Attention Is All You Need' introduced the Transformer architecture now foundational to modern AI models.",
    },
    {
      id: 12,
      question: "The Cricket World Cup is organized by:",
      options: ["BCCI", "ICC (International Cricket Council)", "FIFA", "IOC"],
      correctAnswer: "B",
      explanation: "The International Cricket Council (ICC) organizes the Cricket World Cup.",
    },
    {
      id: 13,
      question:
        "The Academy Awards, popularly known as the Oscars, primarily honor achievements in:",
      options: ["Music", "Film", "Sports", "Science"],
      correctAnswer: "B",
      explanation: "The Academy Awards recognize excellence in cinematic achievement.",
    },
    {
      id: 14,
      question: "The Nobel Peace Prize is awarded each year by the:",
      options: ["Swedish Academy", "Norwegian Nobel Committee", "United Nations", "International Red Cross"],
      correctAnswer: "B",
      explanation: "Unlike other Nobel Prizes awarded in Sweden, the Peace Prize is awarded by the Norwegian Nobel Committee in Oslo.",
    },
    {
      id: 15,
      question: "The Paris Agreement is an international treaty primarily focused on:",
      options: ["Trade tariffs", "Climate change and reducing emissions", "Nuclear disarmament", "Refugee resettlement"],
      correctAnswer: "B",
      explanation: "The Paris Agreement is a legally binding international treaty on climate change, aiming to limit global warming.",
    },
  ],
};

export function getQuestionsForSubject(subjectSlug: string): ApiQuestion[] {
  return QUESTION_BANK[subjectSlug] ?? [];
}
