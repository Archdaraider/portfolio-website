import { contact, projects, swapPoints } from "./portfolio";

describe("portfolio data", () => {
  it("centralises all Phase 2 project asset swaps", () => {
    expect(projects).toHaveLength(4);
    for (const project of projects) {
      expect(project.modelPath).toMatch(/^\/models\/.+\.glb$/);
      expect(project.fallbackImage).toMatch(/^\/images\/.+\.png$/);
      expect(project.links.length).toBeGreaterThanOrEqual(2);
      expect(project.stack.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("lists every planned SWAP hook for the README", () => {
    expect(swapPoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "heroBackdropImage" }),
        expect.objectContaining({ key: "resumePath" }),
        expect.objectContaining({ key: "lutherAIBotModel" }),
        expect.objectContaining({ key: "claimIntegrityAgentModel" }),
        expect.objectContaining({ key: "groundedModel" }),
        expect.objectContaining({ key: "imdaPddModel" }),
      ]),
    );
  });

  it("uses filler contact links for Phase 1", () => {
    expect(contact.email).toBe("hello@example.com");
    expect(contact.resumePath).toBe("/resume-placeholder.pdf");
  });
});
