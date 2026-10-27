// @ts-expect-error Node built-in types are not included in the app tsconfig.
import { existsSync } from "node:fs";
import {
  aboutSlides,
  contact,
  credentials,
  experience,
  profile,
  projects,
  skillGroups,
  stats,
} from "./portfolio";

const publicAsset = (path: string) => existsSync(`public${path}`);

describe("portfolio data", () => {
  it("centralises all project assets and links", () => {
    expect(projects).toHaveLength(4);
    for (const project of projects) {
      expect(project.modelPath).toMatch(/^\/models\/.+\.glb$/);
      expect(project.fallbackImage).toMatch(/^\/images\/.+\.webp$/);
      expect(project.modelHref).toMatch(/^https?:\/\//);
      expect(project.links.length).toBeGreaterThanOrEqual(1);
      expect(project.stack.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("points every referenced image and model at a file in public/", () => {
    const paths = [
      profile.portraitImage,
      contact.resumePath,
      ...projects.flatMap((project) => [project.modelPath, project.fallbackImage]),
      ...experience.map((item) => item.logo),
      ...aboutSlides.map((slide) => slide.image),
      ...credentials.map((credential) => credential.image),
      ...skillGroups.flatMap((group) =>
        group.skills.flatMap((skill) => (skill.logo ? [skill.logo] : [])),
      ),
    ];

    for (const path of paths) {
      expect(publicAsset(path), path).toBe(true);
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

  it("uses Justin's real contact details", () => {
    expect(contact.email).toBe("justingohzk@gmail.com");
    expect(contact.resumePath).toBe("/JustinGoh_Resume.pdf");
    expect(contact.github).toContain("github.com");
    expect(contact.linkedIn).toContain("linkedin.com");
  });

  it("defines the about slideshow images and event captions", () => {
    expect(aboutSlides).toHaveLength(5);
    expect(aboutSlides.map((slide) => slide.title)).toEqual([
      "QoE Product Management and Research Internship @ IMDA",
      "ShopBack Product Managers x NUS Entrepreneur Society",
      "Regional Codex Hackathon",
      "Carousell x OpenAI Hackathon",
      "NUS InterHall Hackathon",
    ]);
  });

  it("lists Temasek Holdings first and provides a logo for every experience", () => {
    expect(experience[0]).toEqual(
      expect.objectContaining({
        role: "Technical Product Management Intern",
        organisation: "Temasek Holdings",
        period: "Jan 2027 - Jun 2027",
        status: "Incoming",
        logo: "/images/temasek-holdings-logo.webp",
      }),
    );

    for (const item of experience) {
      expect(item.logoAlt).toMatch(/logo$/i);
    }
  });

  it("only lists past roles in the hero once Temasek is the next role", () => {
    expect(profile.previousRoles).toEqual([
      "Product / QoE Research Intern at IMDA",
      "Software Engineer Intern at CWT Globelink",
      "Teaching Assistant at NUS Computing",
    ]);
  });

  it("backs every headline stat with a source", () => {
    expect(stats).toHaveLength(4);
    for (const stat of stats) {
      expect(stat.value).toBeGreaterThan(0);
      expect(stat.source).not.toBe("");
    }
  });

  it("keeps the toolkit categorised without duplicate skills", () => {
    expect(credentials.map((credential) => credential.title)).toEqual([
      "IBM Product Management",
      "Google AI Professional",
      "NUS Product Club",
    ]);
    expect(skillGroups.map((group) => group.title)).toEqual([
      "Product judgment",
      "AI systems",
      "Product engineering",
      "Data fluency",
      "Operations",
    ]);
    expect(
      skillGroups.find((group) => group.title === "Product judgment")?.skills.map(
        (skill) => skill.name,
      ),
    ).toEqual([
      "Agile / Scrum Methods",
      "Product Market Research",
      "User Acceptance Testing",
      "UI / UX Design",
      "Roadmapping",
      "QoE Benchmarking",
    ]);

    const names = skillGroups.flatMap((group) => group.skills.map((skill) => skill.name));
    expect(new Set(names).size).toBe(names.length);
  });
});
