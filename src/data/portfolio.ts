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
  // Static render of the model, shown while the GLB loads and for reduced motion.
  fallbackImage: string;
};

export type ExperienceItem = {
  role: string;
  organisation: string;
  period: string;
  // Rendered as a pulsing badge, e.g. "Incoming" for a role that has not started.
  status?: string;
  summary?: string;
  logo: string;
  logoAlt: string;
};

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: string;
};

export type Credential = {
  title: string;
  image: string;
  alt: string;
};

export type Skill = {
  name: string;
  logo?: string;
};

export type SkillGroup = {
  title: string;
  signal: string;
  skills: Skill[];
};

export type AboutSlide = {
  title: string;
  image: string;
  alt: string;
  objectPosition: string;
};

export const profile = {
  name: "Justin Goh",
  degree: "NUS Business AI Systems",
  degreeHref: "https://www.comp.nus.edu.sg/programmes/ug/bais/",
  year: "Penultimate year",
  graduation: "Graduating Dec 2027",
  positioning:
    "AI-focused product builder. I love solving problems, and creating problems to solve.",
  summary:
    "I also bridge product and engineering, turning user discovery into practical AI systems.",
  previousRoles: [
    "Product / QoE Research Intern at IMDA",
    "Software Engineer Intern at CWT Globelink",
    "Teaching Assistant at NUS Computing",
  ],
  portraitImage: "/images/justin-profile.webp",
};

// Proof points pulled from the experience and about content below.
export const stats: Stat[] = [
  {
    value: 20,
    prefix: "~",
    suffix: "%",
    label: "faster report generation",
    source: "CWT Globelink",
  },
  {
    value: 4,
    label: "partners coordinated through UAT",
    source: "IMDA",
  },
  {
    value: 30,
    suffix: "+",
    label: "students led in weekly labs",
    source: "NUS Computing",
  },
  {
    value: 3,
    label: "hackathons built through",
    source: "Codex / OpenAI / InterHall",
  },
];

export const experience: ExperienceItem[] = [
  {
    role: "Technical Product Management Intern",
    organisation: "Temasek Holdings",
    period: "Jan 2027 - Jun 2027",
    status: "Incoming",
    logo: "/images/temasek-holdings-logo.webp",
    logoAlt: "Temasek Holdings logo",
  },
  {
    role: "Product Management & QoE Research Intern",
    organisation: "IMDA Singapore - Punggol Digital District",
    period: "Jan 2026 - Jun 2026",
    summary:
      "Owned the quality-of-experience benchmarking workstream for the district's autonomous-robotics rollout, turning an ambiguous regulatory question into a structured testing framework, running UAT across Umlaut, Accenture, IMDA and GovTech, and producing go/no-go recommendations from experiments on real hardware.",
    logo: "/images/imda-logo.webp",
    logoAlt: "Infocomm Media Development Authority logo",
  },
  {
    role: "Software Engineer Intern",
    organisation: "CWT Globelink (Connecting World Trade)",
    period: "Feb 2024 - Apr 2024",
    summary:
      "Found the highest-leverage bottleneck in the reporting pipeline through stakeholder interviews and shipped a Gen-AI-assisted query layer (Oracle APEX, PL/SQL) that cut report-generation time by ~20%, then authored a build-vs-buy analysis on internal tooling alternatives.",
    logo: "/images/CWT-logo.webp",
    logoAlt: "CWT Globelink logo",
  },
  {
    role: "Undergraduate Teaching Assistant - BT2102",
    organisation: "National University of Singapore",
    period: "Aug 2025 - May 2026",
    summary:
      "Selected across multiple semesters to lead weekly labs for 30+ first-year students on SQL, relational modelling, and Tableau, practising the craft of explaining technical reasoning to non-technical audiences.",
    logo: "/images/nus-logo.webp",
    logoAlt: "National University of Singapore logo",
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
    fallbackImage: "/images/grounded-render.webp",
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
    fallbackImage: "/images/claim-integrity-agent-render.webp",
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
    fallbackImage: "/images/luther-ai-bot-render.webp",
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
    fallbackImage: "/images/auroramart-render.webp",
  },
];

export const aboutSlides: AboutSlide[] = [
  {
    title: "QoE Product Management and Research Internship @ IMDA",
    image: "/images/IMDA-internship.webp",
    alt: "Justin with colleagues at the Infocomm Media Development Authority during his QoE product management and research internship",
    objectPosition: "center 48%",
  },
  {
    title: "ShopBack Product Managers x NUS Entrepreneur Society",
    image: "/images/shopback-pmtalk.webp",
    alt: "Justin with speakers and students at the ShopBack Product Managers x NUS Entrepreneur Society event",
    objectPosition: "center center",
  },
  {
    title: "Regional Codex Hackathon",
    image: "/images/hackathon.webp",
    alt: "Justin and team building at the Regional Codex Hackathon",
    objectPosition: "center 36%",
  },
  {
    title: "Carousell x OpenAI Hackathon",
    image: "/images/carousellxopenai-hackathon.webp",
    alt: "Justin and teammates at the Carousell Campus for the Carousell x OpenAI Hackathon",
    objectPosition: "center center",
  },
  {
    title: "NUS InterHall Hackathon",
    image: "/images/nus-interhall-hackathon.webp",
    alt: "Justin and teammates reviewing a laptop during the NUS InterHall Hackathon",
    objectPosition: "center center",
  },
];

export const credentials: Credential[] = [
  {
    title: "IBM Product Management",
    image: "/images/IBM-PM-cert.webp",
    alt: "IBM Product Management Professional Certification logo",
  },
  {
    title: "Google AI Professional",
    image: "/images/google-ai-professional.webp",
    alt: "Google AI Professional certificate completion logo",
  },
  {
    title: "NUS Product Club",
    image: "/images/NUS-product-club.webp",
    alt: "NUS Product Club logo",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Product judgment",
    signal: "Product Management essential skills",
    skills: [
      { name: "Agile / Scrum Methods" },
      { name: "Product Market Research" },
      { name: "User Acceptance Testing" },
      { name: "UI / UX Design" },
      { name: "Roadmapping" },
      { name: "QoE Benchmarking" },
    ],
  },
  {
    title: "AI systems",
    signal: "Building with agentic tools and AI-native engineering patterns",
    skills: [
      { name: "Claude Code", logo: "/images/claude-code-logo.webp" },
      { name: "OpenAI Codex", logo: "/images/openai-codex-logo.webp" },
      { name: "MCP" },
      { name: "Agent Development" },
      { name: "AI-Native Engineering" },
    ],
  },
  {
    title: "Product engineering",
    signal: "Building interfaces and services that can be tested",
    skills: [
      { name: "Python", logo: "/images/python-logo.webp" },
      { name: "TypeScript", logo: "/images/typescript-logo.webp" },
      { name: "React", logo: "/images/react-logo.webp" },
      { name: "Django", logo: "/images/django-logo.webp" },
      { name: "Flask", logo: "/images/flask-logo.webp" },
      { name: "Java", logo: "/images/java-logo.webp" },
    ],
  },
  {
    title: "Data fluency",
    signal: "Reading the system through its data",
    skills: [
      { name: "SQL", logo: "/images/sql-logo.webp" },
      { name: "Tableau", logo: "/images/tableau-logo.webp" },
      { name: "Oracle APEX", logo: "/images/oracle-apex-logo.webp" },
      { name: "PL/SQL", logo: "/images/plsql-logo.webp" },
    ],
  },
  {
    title: "Operations",
    signal: "Connecting the pieces around the product",
    skills: [
      { name: "Docker", logo: "/images/docker-logo.webp" },
      { name: "n8n", logo: "/images/n8n-logo.webp" },
      { name: "Stripe", logo: "/images/stripe-logo.svg" },
      { name: "Railway", logo: "/images/railway-logo.svg" },
      { name: "Supabase", logo: "/images/supabase-logo.webp" },
    ],
  },
];

export const contact = {
  email: "justingohzk@gmail.com",
  linkedIn: "https://linkedin.com/in/gohgohthejustin",
  github: "https://github.com/Archdaraider",
  resumePath: "/JustinGoh_Resume.pdf",
  availability: "Full-time roles from Jan 2028 / Open to chats now",
  location: "Singapore / remote",
};
