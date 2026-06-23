export type PortfolioLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  hook: string;
  impact: string[];
  stack: string[];
  links: PortfolioLink[];
  // Primary destination when the 3D model is clicked (repo or live site).
  modelHref: string;
  modelPath: string;
  fallbackImage: string;
};

export type ExperienceItem = {
  role: string;
  organisation: string;
  period: string;
  summary: string;
};

export type Certification = {
  title: string;
  issuer: string;
  year: string;
};

export type SkillLogo = {
  title: string;
  image: string;
  alt: string;
};

export type SkillGroup = {
  title: string;
  signal: string;
  skills: string[];
  logos?: SkillLogo[];
  credentials?: SkillLogo[];
};

export type AboutSlide = {
  title: string;
  image: string;
  alt: string;
  objectPosition: string;
};

export type SwapPoint = {
  key: string;
  path: string;
  note: string;
};

export const profile = {
  name: "Justin Goh",
  eyebrow: "NUS Business AI Systems Penultimate Year",
  graduation: "Graduating Dec 2027",
  positioning:
    "AI-focused product builder. I love solving problems, and creating problems to solve.",
  summary:
    "I also bridge product and engineering, turning user discovery into practical AI systems.",
  heroMetrics: [
    "Product / QoE Research Intern at IMDA",
    "Software Engineer Intern at CWT Globelink",
    "Teaching Assistant at NUS Computing",
  ],
  portraitImage: "/images/justin-profile.png",
  // Used behind the About section as supporting context.
  aboutImage: "/images/hackathon.png",
};

// Sliding marquee content: capabilities first, then credentials.
export const marquee = {
  skills: [
    "Agile / Scrum Methods",
    "Product Market Research",
    "User Acceptance Testing",
    "UI / UX Design",
    "Roadmapping",
    "QoE Benchmarking",
    "Claude Code",
    "OpenAI Codex",
    "MCP",
    "Agent Development",
    "AI-Native Engineering",
    "Python",
    "SQL",
    "PL/SQL",
    "Oracle APEX",
    "Java",
    "Flask",
    "Django",
    "React",
    "TypeScript",
    "Tableau",
    "Docker",
    "n8n",
    "Stripe",
    "Railway",
    "Supabase",
  ],
  certifications: [] as string[],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Credentials",
    signal: "Formal product and AI foundations",
    skills: [],
    credentials: [
      {
        title: "IBM Product Management",
        image: "/images/IBM-PM-cert.png",
        alt: "IBM Product Management Professional Certification logo",
      },
      {
        title: "Google AI Professional",
        image: "/images/google-ai-professional.png",
        alt: "Google AI Professional certificate completion logo",
      },
      {
        title: "NUS Product Club",
        image: "/images/NUS-product-club.png",
        alt: "NUS Product Club logo",
      },
    ],
  },
  {
    title: "Product judgment",
    signal: "Product Management essential skills",
    skills: [
      "Agile / Scrum Methods",
      "Product Market Research",
      "User Acceptance Testing",
      "UI / UX Design",
      "Roadmapping",
      "QoE Benchmarking",
    ],
  },
  {
    title: "AI systems",
    signal: "Building with agentic tools and AI-native engineering patterns",
    skills: [
      "Claude Code",
      "OpenAI Codex",
      "MCP",
      "Agent Development",
      "AI-Native Engineering",
    ],
  },
  {
    title: "Product engineering",
    signal: "Building interfaces and services that can be tested",
    skills: ["React", "TypeScript", "Flask", "Django", "Java", "Python"],
    logos: [
      {
        title: "Claude Code",
        image: "/images/claude-code-logo.png",
        alt: "Claude Code logo",
      },
      {
        title: "OpenAI Codex",
        image: "/images/openai-codex-logo.png",
        alt: "OpenAI Codex logo",
      },
      {
        title: "TypeScript",
        image: "/images/typescript-logo.png",
        alt: "TypeScript logo",
      },
      {
        title: "Django",
        image: "/images/django-logo.png",
        alt: "Django logo",
      },
      {
        title: "Flask",
        image: "/images/flask-logo.png",
        alt: "Flask logo",
      },
      {
        title: "Java",
        image: "/images/java-logo.png",
        alt: "Java logo",
      },
      {
        title: "Python",
        image: "/images/python-logo.png",
        alt: "Python logo",
      },
      {
        title: "React",
        image: "/images/react-logo.png",
        alt: "React logo",
      },
    ],
  },
  {
    title: "Data fluency",
    signal: "Reading the system through its data",
    skills: ["SQL", "Tableau", "Oracle APEX", "PL/SQL"],
    logos: [
      {
        title: "SQL",
        image: "/images/sql-logo.jpg",
        alt: "SQL logo",
      },
      {
        title: "Tableau",
        image: "/images/tableau-logo.png",
        alt: "Tableau logo",
      },
      {
        title: "Oracle APEX",
        image: "/images/oracle-apex-logo.jpg",
        alt: "Oracle APEX logo",
      },
      {
        title: "PL/SQL",
        image: "/images/plsql-logo.jpg",
        alt: "Oracle PL/SQL logo",
      },
    ],
  },
  {
    title: "Operations",
    signal: "Connecting the pieces around the product",
    skills: ["Docker", "n8n", "Stripe", "Railway", "Supabase"],
    logos: [
      {
        title: "Docker",
        image: "/images/docker-logo.png",
        alt: "Docker logo",
      },
      {
        title: "n8n",
        image: "/images/n8n-logo.png",
        alt: "n8n logo",
      },
      {
        title: "Stripe",
        image: "/images/stripe-logo.svg",
        alt: "Stripe logo",
      },
      {
        title: "Railway",
        image: "/images/railway-logo.svg",
        alt: "Railway logo",
      },
      {
        title: "Supabase",
        image: "/images/supabase-logo.png",
        alt: "Supabase logo",
      },
    ],
  },
];

export const certifications: Certification[] = [
  {
    title: "Product Management Professional Certification",
    issuer: "IBM",
    year: "2026",
  },
  {
    title: "AI Professional Certification",
    issuer: "Google",
    year: "2026",
  },
];

export const aboutSlides: AboutSlide[] = [
  {
    title: "ShopBack Product Managers x NUS Entrepreneur Society",
    image: "/images/shopback-pmtalk.jpg",
    alt: "Justin with speakers and students at the ShopBack Product Managers x NUS Entrepreneur Society event",
    objectPosition: "center center",
  },
  {
    title: "NUS InterHall Hackathon",
    image: "/images/nus-interhall-hackathon.jpg",
    alt: "Justin and teammates reviewing a laptop during the NUS InterHall Hackathon",
    objectPosition: "center center",
  },
  {
    title: "Regional Codex Hackathon",
    image: "/images/hackathon.png",
    alt: "Justin and team building at the Regional Codex Hackathon",
    objectPosition: "center 36%",
  },
];

export const aboutPrinciples = [
  {
    title: "Discovery before code",
    copy: "I interview the people inside the workflow first — advisors, operators, stakeholders — and map the real pain before a line gets written.",
  },
  {
    title: "First principles, then depth",
    copy: "Strip the regulatory or product question down to its actual constraint, then bring the technical depth to scope and validate the answer.",
  },
  {
    title: "Ship, then measure",
    copy: "Get something concrete into production and track the before-and-after. A cut cycle-time is worth more than a tidy hypothesis.",
  },
];

export const projects: Project[] = [
  {
    id: "grounded",
    title: "Grounded",
    hook: "Real-time interview coaching that watches how you actually answer.",
    impact: [
      "Scores speech, content, and body-language signals in real time.",
      "Turns each interview into a resume-aware coaching report.",
      "Runs on Flask, Socket.IO, MediaPipe, Groq, OAuth, and Stripe tiers.",
    ],
    stack: ["Flask", "Socket.IO", "Groq", "MediaPipe", "Stripe"],
    links: [{ label: "Live app", href: "https://groundedinterviews.com" }],
    modelHref: "https://groundedinterviews.com",
    modelPath: "/models/grounded.glb",
    fallbackImage: "/images/grounded-fallback.png",
  },
  {
    id: "claim-integrity-agent",
    title: "Claim Integrity Agent",
    hook: "An explainable risk score for the refund economy.",
    impact: [
      "Combines vision plausibility, image reuse, and behaviour signals.",
      "Produces an explainable 0-100 refund-risk score for reviewers.",
      "Keeps legitimate claims low-risk with regression-gated scoring.",
    ],
    stack: ["React", "TypeScript", "Express", "OpenAI Vision"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/onepang04/openai-x-sea-hackathon-group-14",
      },
    ],
    modelHref: "https://github.com/onepang04/openai-x-sea-hackathon-group-14",
    modelPath: "/models/claim-integrity-agent.glb",
    fallbackImage: "/images/claim-integrity-agent-fallback.png",
  },
  {
    id: "luther-ai-bot",
    title: "LutherAIBot",
    hook: "Vertical B2B AI SaaS for financial advisors.",
    impact: [
      "Mapped advisor and PA workflows through discovery interviews.",
      "Scoped a PA-first MVP for client logistics and CRM automation.",
      "Kept the agent workflow practical for regulated PDPA contexts.",
    ],
    stack: ["Product Management", "OpenClaw", "Agent Platform", "PDPA"],
    links: [
      { label: "Website", href: "https://lutheraibot.com" },
      { label: "OpenClaw", href: "https://openclaw.ai/" },
    ],
    modelHref: "https://lutheraibot.com",
    modelPath: "/models/luther-ai-bot.glb",
    fallbackImage: "/images/luther-ai-bot-fallback.png",
  },
  {
    id: "auroramart",
    title: "AuroraMart",
    hook: "An e-commerce platform mapped from discovery to checkout.",
    impact: [
      "Built a Django/SQLite e-commerce flow from discovery to checkout.",
      "Documented authentication, inventory states, and payment edge cases.",
      "Packaged the NUS IS2108 build with launch docs and user-flow maps.",
    ],
    stack: ["Django", "SQLite", "RESTful APIs", "Python"],
    links: [{ label: "Repository", href: "https://github.com/Archdaraider/IS2108" }],
    modelHref: "https://github.com/Archdaraider/IS2108",
    modelPath: "/models/auroramart.glb",
    fallbackImage: "/images/auroramart-fallback.png",
  },
];

export const experience: ExperienceItem[] = [
  {
    role: "Product Management & QoE Research Intern",
    organisation: "IMDA Singapore — Punggol Digital District",
    period: "Jan 2026 – Jun 2026",
    summary:
      "Owned the quality-of-experience benchmarking workstream for the district's autonomous-robotics rollout — turning an ambiguous regulatory question into a structured testing framework, running UAT across Umlaut, Accenture, IMDA and GovTech, and producing go/no-go recommendations from experiments on real hardware.",
  },
  {
    role: "Software Engineer Intern",
    organisation: "CWT Globelink (Connecting World Trade)",
    period: "Feb 2024 – Apr 2024",
    summary:
      "Found the highest-leverage bottleneck in the reporting pipeline through stakeholder interviews and shipped a Gen-AI-assisted query layer (Oracle APEX, PL/SQL) that cut report-generation time by ~20%, then authored a build-vs-buy analysis on internal tooling alternatives.",
  },
  {
    role: "Undergraduate Teaching Assistant — BT2102",
    organisation: "National University of Singapore",
    period: "Aug 2025 – May 2026",
    summary:
      "Selected across multiple semesters to lead weekly labs for 30+ first-year students on SQL, relational modelling, and Tableau — practising the craft of explaining technical reasoning to non-technical audiences.",
  },
];

export const contact = {
  email: "justingohzk@gmail.com",
  linkedIn: "https://linkedin.com/in/gohgohthejustin",
  github: "https://github.com/Archdaraider",
  resumePath: "/JustinGoh_Resume.pdf",
};

export const swapPoints: SwapPoint[] = [
  {
    key: "groundedModel",
    path: "public/models/grounded.glb",
    note: "Drop the final Grounded model at this path (Blender export).",
  },
  {
    key: "claimIntegrityAgentModel",
    path: "public/models/claim-integrity-agent.glb",
    note: "Drop the final Claim Integrity Agent model at this path.",
  },
  {
    key: "lutherAIBotModel",
    path: "public/models/luther-ai-bot.glb",
    note: "Drop the final LutherAIBot model at this path.",
  },
  {
    key: "auroraMartModel",
    path: "public/models/auroramart.glb",
    note: "Drop the final AuroraMart model at this path.",
  },
  {
    key: "projectLinks",
    path: "src/data/portfolio.ts",
    note: "Replace the github.com stub hrefs (links + modelHref) with real repo/live URLs per project.",
  },
];
