import { aboutSlides, contact, marquee, projects, skillGroups, swapPoints } from "./portfolio";

describe("portfolio data", () => {
  it("centralises all project assets and links", () => {
    expect(projects).toHaveLength(4);
    for (const project of projects) {
      expect(project.modelPath).toMatch(/^\/models\/.+\.glb$/);
      expect(project.fallbackImage).toMatch(/^\/images\/.+\.png$/);
      expect(project.modelHref).toMatch(/^https?:\/\//);
      expect(project.links.length).toBeGreaterThanOrEqual(1);
      expect(project.stack.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("uses the requested project destinations", () => {
    expect(projects.find((project) => project.id === "grounded")?.links).toEqual([
      { label: "Live app", href: "https://groundedinterviews.com" },
    ]);
    expect(
      projects.find((project) => project.id === "claim-integrity-agent")?.links,
    ).toEqual([
      {
        label: "Repository",
        href: "https://github.com/onepang04/openai-x-sea-hackathon-group-14",
      },
    ]);
    expect(projects.find((project) => project.id === "luther-ai-bot")?.links).toEqual([
      { label: "Website", href: "https://lutheraibot.com" },
      { label: "OpenClaw", href: "https://openclaw.ai/" },
    ]);
    expect(projects.find((project) => project.id === "auroramart")?.links).toEqual([
      { label: "Repository", href: "https://github.com/Archdaraider/IS2108" },
    ]);
  });

  it("orders projects Grounded, Claim Integrity, LutherAIBot, AuroraMart", () => {
    expect(projects.map((project) => project.id)).toEqual([
      "grounded",
      "claim-integrity-agent",
      "luther-ai-bot",
      "auroramart",
    ]);
  });

  it("lists the planned model SWAP hooks for the README", () => {
    expect(swapPoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "groundedModel" }),
        expect.objectContaining({ key: "claimIntegrityAgentModel" }),
        expect.objectContaining({ key: "lutherAIBotModel" }),
        expect.objectContaining({ key: "auroraMartModel" }),
      ]),
    );
  });

  it("uses Justin's real contact details", () => {
    expect(contact.email).toBe("justingohzk@gmail.com");
    expect(contact.resumePath).toBe("/JustinGoh_Resume.pdf");
    expect(contact.github).toContain("github.com");
    expect(contact.linkedIn).toContain("linkedin.com");
  });

  it("defines the about slideshow images and event captions", () => {
    expect(aboutSlides).toHaveLength(3);
    expect(aboutSlides.map((slide) => slide.image)).toEqual([
      "/images/shopback-pmtalk.jpg",
      "/images/nus-interhall-hackathon.jpg",
      "/images/hackathon.png",
    ]);
    expect(aboutSlides.map((slide) => slide.title)).toEqual([
      "ShopBack Product Managers x NUS Entrepreneur Society",
      "NUS InterHall Hackathon",
      "Regional Codex Hackathon",
    ]);
  });

  it("categorizes every listed skill in the skill map", () => {
    const categorizedSkills = new Set(
      skillGroups.flatMap((group) => group.skills),
    );

    expect(skillGroups[0].title).toBe("Credentials");
    expect(skillGroups[0].credentials?.map((credential) => credential.image)).toEqual([
      "/images/IBM-PM-cert.png",
      "/images/google-ai-professional.png",
      "/images/NUS-product-club.png",
    ]);
    expect(skillGroups[0].skills).toEqual([]);
    expect(skillGroups.find((group) => group.title === "Product judgment")).toEqual(
      expect.objectContaining({
        signal: "Product Management essential skills",
        skills: [
          "Agile / Scrum Methods",
          "Product Market Research",
          "User Acceptance Testing",
          "UI / UX Design",
          "Roadmapping",
          "QoE Benchmarking",
        ],
      }),
    );
    expect(skillGroups.find((group) => group.title === "AI systems")?.skills).toEqual([
      "Claude Code",
      "OpenAI Codex",
      "MCP",
      "Agent Development",
      "AI-Native Engineering",
    ]);
    expect(skillGroups.find((group) => group.title === "Product engineering")?.logos?.map((logo) => logo.image)).toEqual([
      "/images/claude-code-logo.png",
      "/images/openai-codex-logo.png",
      "/images/typescript-logo.png",
      "/images/django-logo.png",
      "/images/flask-logo.png",
      "/images/java-logo.png",
      "/images/python-logo.png",
      "/images/react-logo.png",
    ]);
    expect(skillGroups.find((group) => group.title === "Data fluency")?.logos?.map((logo) => logo.image)).toEqual([
      "/images/sql-logo.jpg",
      "/images/tableau-logo.png",
      "/images/oracle-apex-logo.jpg",
      "/images/plsql-logo.jpg",
    ]);
    const operations = skillGroups.find((group) => group.title === "Operations");
    expect(operations?.skills).toEqual([
      "Docker",
      "n8n",
      "Stripe",
      "Railway",
      "Supabase",
    ]);
    expect(operations?.skills).not.toContain("OAuth");
    expect(operations?.skills).not.toContain("PDPA");
    expect(operations?.logos?.map((logo) => logo.image)).toEqual([
      "/images/docker-logo.png",
      "/images/n8n-logo.png",
      "/images/stripe-logo.svg",
      "/images/railway-logo.svg",
      "/images/supabase-logo.png",
    ]);

    for (const skill of marquee.skills) {
      expect(categorizedSkills).toContain(skill);
    }
  });
});
