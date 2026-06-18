import { aboutSlides, contact, projects, swapPoints } from "./portfolio";

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
      { label: "Live app", href: "https://getgrounded.com" },
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
});
