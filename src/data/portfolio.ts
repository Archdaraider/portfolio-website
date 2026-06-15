export type PortfolioLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  hook: string;
  impact: string;
  stack: string[];
  links: PortfolioLink[];
  modelPath: string;
  fallbackImage: string;
  modelLabel: string;
};

export type ExperienceItem = {
  role: string;
  organisation: string;
  period: string;
  summary: string;
};

export type SwapPoint = {
  key: string;
  path: string;
  note: string;
};

export const profile = {
  name: "Justin",
  eyebrow: "NUS Business AI Systems | Year 2",
  graduation: "Graduating Dec 2027",
  positioning:
    "First-principles product engineering and novel AI systems.",
  summary:
    "I sit between engineering and product, where vague problems become shippable systems. I like fast prototypes, precise research, and ideas that are slightly too specific to be template work.",
  heroMetrics: [
    "Founder & Lead, LutherAIBot",
    "Product / Research Intern, IMDA Singapore",
    "Software Engineer, logistics freight",
  ],
  // SWAP: Replace with a real hero render or portrait-adjacent abstract image.
  heroBackdropImage: "/images/hero-warm-abstract.png",
};

export const aboutPrinciples = [
  {
    title: "Build fast",
    copy: "I prefer a working system over a meeting about a hypothetical system. Tastefully, of course.",
  },
  {
    title: "Reason from first principles",
    copy: "Strip away the fashionable layer, find the actual constraint, then build around that.",
  },
  {
    title: "Novel over derivative",
    copy: "If the result could have come from a template, it probably needs another pass.",
  },
];

export const projects: Project[] = [
  {
    id: "luther-ai-bot",
    title: "LutherAIBot",
    hook: "A conversational bridge between legacy data and modern inference.",
    impact:
      "Founded and led a bot project that turns scattered internal knowledge into a cleaner question-answering flow. The interesting part is not that it chats, but that it makes the right context show up before everyone forgets what they were looking for.",
    stack: ["Python", "FastAPI", "Vector search", "LLM orchestration"],
    links: [
      // SWAP: Replace placeholder LutherAIBot links with live repo/case study URLs.
      { label: "View project", href: "#" },
      { label: "Technical notes", href: "#" },
    ],
    // SWAP: Drop the final LutherAIBot .glb here.
    modelPath: "/models/luther-ai-bot.glb",
    // SWAP: Replace with a final LutherAIBot fallback render.
    fallbackImage: "/images/luther-ai-bot-fallback.png",
    modelLabel: "assistant core",
  },
  {
    id: "claim-integrity-agent",
    title: "Claim Integrity Agent",
    hook: "Real-time risk scoring for the refund economy.",
    impact:
      "A refund-fraud detection scaffold for scoring claim risk as events arrive, then explaining why a case deserves attention. The point is not to shout fraud at everything. The point is to make uncertainty legible.",
    stack: ["TypeScript", "Risk scoring", "Event streams", "PostgreSQL"],
    links: [
      // SWAP: Replace placeholder Claim Integrity links with final artefacts.
      { label: "Case study", href: "#" },
      { label: "System map", href: "#" },
    ],
    // SWAP: Drop the final Claim Integrity Agent .glb here.
    modelPath: "/models/claim-integrity-agent.glb",
    // SWAP: Replace with a final Claim Integrity fallback render.
    fallbackImage: "/images/claim-integrity-agent-fallback.png",
    modelLabel: "risk lattice",
  },
  {
    id: "grounded",
    title: "Grounded",
    hook: "On-device interview coaching without the privacy trade-off.",
    impact:
      "A coaching app concept that analyses communication signals locally, then turns them into usable feedback for high-stakes interviews. It is deliberately boring about privacy, which is the correct kind of boring.",
    stack: ["React", "Python", "On-device AI", "Signal analysis"],
    links: [
      // SWAP: Replace placeholder Grounded links with demo/product URLs.
      { label: "View build", href: "#" },
      { label: "Privacy notes", href: "#" },
    ],
    // SWAP: Drop the final Grounded .glb here.
    modelPath: "/models/grounded.glb",
    // SWAP: Replace with a final Grounded fallback render.
    fallbackImage: "/images/grounded-fallback.png",
    modelLabel: "local signal",
  },
  {
    id: "imda-pdd",
    title: "IMDA / Punggol Digital District",
    hook: "User research and quality-of-experience benchmarking for a smart district.",
    impact:
      "Product and research work across Punggol Digital District contexts, with attention to how people actually experience infrastructure once the diagram has left the slide. Good benchmarks are less glamorous than demos, and far more useful.",
    stack: ["User research", "QoE benchmarking", "Product analysis", "Singapore"],
    links: [
      // SWAP: Replace placeholder IMDA/PDD links with public work or notes.
      { label: "Overview", href: "#" },
      { label: "Research notes", href: "#" },
    ],
    // SWAP: Drop the final IMDA/PDD .glb here.
    modelPath: "/models/imda-pdd.glb",
    // SWAP: Replace with a final IMDA/PDD fallback render.
    fallbackImage: "/images/imda-pdd-fallback.png",
    modelLabel: "district mesh",
  },
];

export const experience: ExperienceItem[] = [
  {
    role: "Product / Research Intern",
    organisation: "IMDA Singapore",
    period: "2026",
    summary:
      "Worked on Punggol Digital District research, user insight synthesis, and quality-of-experience benchmarking.",
  },
  {
    role: "Software Engineer",
    organisation: "Logistics freight company",
    period: "2025",
    summary:
      "Built operational software in a domain where edge cases arrive by truck and do not apologise.",
  },
  {
    role: "Founder & Lead",
    organisation: "LutherAIBot",
    period: "2024 to present",
    summary:
      "Led product direction and engineering for an AI assistant project focused on useful retrieval, not theatre.",
  },
];

export const contact = {
  // SWAP: Replace with Justin's real email.
  email: "hello@example.com",
  // SWAP: Replace with Justin's real LinkedIn URL.
  linkedIn: "#",
  // SWAP: Replace with Justin's real GitHub URL.
  github: "#",
  // SWAP: Replace with the final resume PDF path.
  resumePath: "/resume-placeholder.pdf",
};

export const swapPoints: SwapPoint[] = [
  {
    key: "heroBackdropImage",
    path: "src/data/portfolio.ts",
    note: "Replace the hero abstract image path with a final portrait, render, or art-directed bitmap.",
  },
  {
    key: "lutherAIBotModel",
    path: "public/models/luther-ai-bot.glb",
    note: "Drop the final LutherAIBot model at this path.",
  },
  {
    key: "lutherAIBotLinks",
    path: "src/data/portfolio.ts",
    note: "Replace LutherAIBot project and technical-note href placeholders.",
  },
  {
    key: "lutherAIBotFallback",
    path: "public/images/luther-ai-bot-fallback.png",
    note: "Replace the generated LutherAIBot fallback still.",
  },
  {
    key: "claimIntegrityAgentModel",
    path: "public/models/claim-integrity-agent.glb",
    note: "Drop the final Claim Integrity Agent model at this path.",
  },
  {
    key: "claimIntegrityAgentLinks",
    path: "src/data/portfolio.ts",
    note: "Replace Claim Integrity case-study and system-map href placeholders.",
  },
  {
    key: "claimIntegrityAgentFallback",
    path: "public/images/claim-integrity-agent-fallback.png",
    note: "Replace the generated Claim Integrity fallback still.",
  },
  {
    key: "groundedModel",
    path: "public/models/grounded.glb",
    note: "Drop the final Grounded model at this path.",
  },
  {
    key: "groundedLinks",
    path: "src/data/portfolio.ts",
    note: "Replace Grounded build and privacy-note href placeholders.",
  },
  {
    key: "groundedFallback",
    path: "public/images/grounded-fallback.png",
    note: "Replace the generated Grounded fallback still.",
  },
  {
    key: "imdaPddModel",
    path: "public/models/imda-pdd.glb",
    note: "Drop the final IMDA/PDD model at this path.",
  },
  {
    key: "imdaPddLinks",
    path: "src/data/portfolio.ts",
    note: "Replace IMDA/PDD overview and research-note href placeholders.",
  },
  {
    key: "imdaPddFallback",
    path: "public/images/imda-pdd-fallback.png",
    note: "Replace the generated IMDA/PDD fallback still.",
  },
  {
    key: "contactEmail",
    path: "src/data/portfolio.ts",
    note: "Replace hello@example.com with Justin's real email.",
  },
  {
    key: "contactLinkedIn",
    path: "src/data/portfolio.ts",
    note: "Replace the LinkedIn placeholder URL.",
  },
  {
    key: "contactGitHub",
    path: "src/data/portfolio.ts",
    note: "Replace the GitHub placeholder URL.",
  },
  {
    key: "resumePath",
    path: "src/data/portfolio.ts",
    note: "Replace /resume-placeholder.pdf with the final resume PDF.",
  },
];
