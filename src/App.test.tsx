import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useFrame: () => undefined,
}));

vi.mock("@react-three/drei", () => ({
  Center: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Environment: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  OrbitControls: () => null,
  PresentationControls: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useGLTF: () => ({ scene: { clone: () => ({}) } }),
}));

describe("App", () => {
  it("renders the recruiter-critical portfolio sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /Justin/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /About/i })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Projects/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Experience/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Contact/i }),
    ).toBeInTheDocument();
  });

  it("renders all four project model slots and swap labels", () => {
    render(<App />);

    expect(screen.getAllByText(/SWAP \.glb/i)).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "LutherAIBot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Claim Integrity Agent" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Grounded" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "IMDA / Punggol Digital District",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the primary HR actions obvious", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: /View projects/i }),
    ).toHaveAttribute("href", "#projects");
    expect(
      screen.getByRole("link", { name: /Download resume/i }),
    ).toHaveAttribute("href", "/resume-placeholder.pdf");
    expect(screen.getByRole("link", { name: /Email Justin/i })).toHaveAttribute(
      "href",
      "mailto:hello@example.com",
    );
  });
});
