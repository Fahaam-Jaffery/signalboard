export type LandingPageIdea = {
  title: string;
  description: string;
  targetAudience?: string;
  whyNow?: string;
  category?: string;
  monetization?: string;
};

export type LandingPageSection = {
  type: "hero" | "problem" | "benefits" | "howItWorks" | "socialProof" | "cta";
  eyebrow: string;
  title: string;
  body: string;
  items?: string[];
};

export type LandingPageConfig = {
  version: 1;
  theme: "violet" | "ocean" | "ember";
  layout: "editorial" | "minimal" | "bold";
  headline: string;
  subheadline: string;
  audience: string;
  problem: string;
  solution: string;
  benefits: string[];
  sections: LandingPageSection[];
};

const themes = [
  { name: "violet" as const, words: ["creator", "design", "marketing", "productivity", "saas"] },
  { name: "ocean" as const, words: ["research", "data", "finance", "client", "analytics", "workflow"] },
  { name: "ember" as const, words: ["fitness", "food", "travel", "community", "wellness", "tender"] },
];

const clean = (value: unknown, fallback: string, max = 500) =>
  (typeof value === "string" ? value.trim() : "").slice(0, max) || fallback;

const sentence = (value: string) => value.replace(/[.!?\s]+$/, "");

export function buildLandingPage(idea: LandingPageIdea): {
  headline: string;
  content: LandingPageConfig;
} {
  const title = clean(idea.title, "Your next idea", 100);
  const description = clean(idea.description, "A more focused way to solve a real problem.", 500);
  const audience = clean(idea.targetAudience, "People looking for a simpler solution", 250);
  const category = clean(idea.category, "productivity", 80).toLowerCase();
  const theme = themes.find((item) => item.words.some((word) => category.includes(word)))?.name ?? "violet";
  const headline = `A better way to ${title.toLowerCase()}.`;
  const problem = `${audience} often have to juggle disconnected tools and repetitive work. The result is more friction than the problem deserves.`;
  const benefits = [
    "Spend less time on repetitive tasks",
    "Keep the important work in one clear place",
    "Shape a focused tool around real needs",
  ];
  const content: LandingPageConfig = {
    version: 1,
    theme,
    layout: category.includes("research") || category.includes("marketing") ? "editorial" : category.includes("fitness") || category.includes("community") ? "bold" : "minimal",
    headline,
    subheadline: description,
    audience,
    problem,
    solution: description,
    benefits,
    sections: [
      { type: "hero", eyebrow: `INTRODUCING ${title.toUpperCase()}`, title: headline, body: description, items: ["Early access", "Built around your feedback"] },
      { type: "problem", eyebrow: "THE CHALLENGE", title: "The current way takes too much effort.", body: problem },
      { type: "benefits", eyebrow: "A MORE FOCUSED APPROACH", title: "Less friction. More forward.", body: `A simpler experience for ${audience.toLowerCase()}.`, items: benefits },
      { type: "howItWorks", eyebrow: "GET STARTED", title: "Start small. Learn quickly.", body: "Join the early list, tell us what matters, and help shape what gets built next.", items: ["Join the early-access list", "Share the workflow you want to improve", "Get updates as the concept evolves"] },
      { type: "cta", eyebrow: "BE PART OF THE FIRST WAVE", title: "Help shape what comes next.", body: "Get occasional updates and an invitation to try the product when it is ready." },
    ],
  };
  return { headline, content };
}

export function validateLandingPageConfig(value: unknown): value is LandingPageConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<LandingPageConfig>;
  return config.version === 1
    && ["violet", "ocean", "ember"].includes(String(config.theme))
    && ["editorial", "minimal", "bold"].includes(String(config.layout))
    && typeof config.headline === "string"
    && typeof config.subheadline === "string"
    && typeof config.audience === "string"
    && Array.isArray(config.benefits)
    && config.benefits.every((item) => typeof item === "string")
    && Array.isArray(config.sections)
    && config.sections.every((section) => section && typeof section.title === "string" && typeof section.body === "string");
}
