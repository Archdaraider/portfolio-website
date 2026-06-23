import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

const dreiMocks = vi.hoisted(() => ({
  useGLTF: vi.fn(),
}));
const lenisMocks = vi.hoisted(() => ({
  scrollTo: vi.fn(),
  raf: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: vi.fn(function () {
    return lenisMocks;
  }),
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useFrame: () => undefined,
  useThree: (selector: (state: {
    camera: { lookAt: () => void; updateProjectionMatrix: () => void };
    size: { width: number; height: number };
  }) => unknown) =>
    selector({
      camera: {
        lookAt: () => undefined,
        updateProjectionMatrix: () => undefined,
      },
      size: { width: 1440, height: 1000 },
    }),
}));

vi.mock("@react-three/drei", async () => {
  const { Group } = await vi.importActual<typeof import("three")>("three");
  dreiMocks.useGLTF.mockImplementation(() => ({ scene: new Group(), animations: [] }));

  return {
    Center: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Environment: () => null,
    Html: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    OrbitControls: () => null,
    PerspectiveCamera: () => null,
    PresentationControls: ({
      children,
      polar,
      azimuth,
    }: {
      children: React.ReactNode;
      polar?: [number, number];
      azimuth?: [number, number];
    }) => (
      <div
        data-testid="presentation-controls"
        data-polar={JSON.stringify(polar)}
        data-azimuth={JSON.stringify(azimuth)}
      >
        {children}
      </div>
    ),
    useAnimations: () => ({ actions: {}, names: [] }),
    useGLTF: dreiMocks.useGLTF,
  };
});

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    lenisMocks.scrollTo.mockClear();
    lenisMocks.raf.mockClear();
    lenisMocks.destroy.mockClear();
  });

  beforeEach(() => {
    window.sessionStorage.clear();
    dreiMocks.useGLTF.mockClear();
  });

  it("loads the animated press keycap model for the intro", async () => {
    render(<App />);

    await screen.findByRole("dialog", { name: /Intro landing/i });

    expect(dreiMocks.useGLTF).toHaveBeenCalledWith(
      "/models/intro-keycap-press.glb",
      true,
    );
  });

  it("presses and rebounds the keycap before completing the intro", async () => {
    render(<App />);

    expect(
      await screen.findByRole("dialog", { name: /Intro landing/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: /click me/i }));

    const intro = screen.getByRole("dialog", { name: /Intro landing/i });
    expect(intro).toHaveAttribute("data-intro-phase", "pressing");
    expect(intro).toHaveClass("is-pressing");
    expect(window.sessionStorage.getItem("justin-portfolio-intro-seen")).toBeNull();

    act(() => vi.advanceTimersByTime(260));
    expect(intro).toHaveAttribute("data-intro-phase", "rebounding");
    expect(intro).toHaveClass("is-rebounding");
    expect(window.sessionStorage.getItem("justin-portfolio-intro-seen")).toBeNull();

    act(() => vi.advanceTimersByTime(320));
    expect(intro).toHaveAttribute("data-intro-phase", "revealing");
    expect(intro).toHaveClass("is-revealing");

    act(() => vi.advanceTimersByTime(620));

    expect(
      screen.queryByRole("dialog", { name: /Intro landing/i }),
    ).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("justin-portfolio-intro-seen")).toBe(
      "true",
    );
  });

  it("keeps the portfolio shell dimmed until the intro finishes", async () => {
    render(<App />);
    await screen.findByRole("button", { name: /click me/i });
    vi.useFakeTimers();

    const shell = document.querySelector(".portfolio-shell");
    expect(shell).toHaveClass("is-intro-active");

    fireEvent.click(screen.getByRole("button", { name: /click me/i }));
    act(() => vi.advanceTimersByTime(580));
    expect(shell).toHaveClass("is-intro-active");

    act(() => vi.advanceTimersByTime(620));
    expect(shell).toHaveClass("is-intro-complete");
  });

  it("registers reveal elements for scroll-triggered entry motion", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const IntersectionObserverMock = vi.fn(function () {
      return {
        observe,
        unobserve: vi.fn(),
        disconnect,
      };
    });
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");

    render(<App />);

    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      root: null,
      rootMargin: "0px 0px -14% 0px",
      threshold: 0.16,
    });
    expect(observe.mock.calls.length).toBeGreaterThan(8);
  });

  it("keeps the custom scroll wheel fixed on mobile", async () => {
    // @ts-expect-error Node built-in types are not included in the app tsconfig.
    const { readFileSync } = (await import("node:fs")) as {
      readFileSync: (path: string, encoding: string) => string;
    };
    const stylesCss = readFileSync("src/styles.css", "utf8");

    expect(stylesCss).toMatch(/\.scroll-wheel\s*{[^}]*position:\s*fixed;/s);
    expect(stylesCss).not.toMatch(
      /@media\s*\(max-width:\s*900px\)\s*{[^}]*\.scroll-wheel\s*{[^}]*display:\s*none/s,
    );
  });

  it("shows January 2027 internship and full-time availability", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");

    render(<App />);

    expect(
      screen.getByText("2027 January / Internships / Full-Time"),
    ).toBeInTheDocument();
  });

  it("skips the keycap intro after it has been seen in the current session", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");

    render(<App />);

    expect(
      screen.queryByRole("dialog", { name: /Intro landing/i }),
    ).not.toBeInTheDocument();
  });

  it("reopens the keycap intro from the J navigation mark", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: "J" }));

    return expect(
      screen.findByRole("dialog", { name: /Intro landing/i }),
    ).resolves.toBeInTheDocument();
  });

  it("renders the recruiter-critical portfolio sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /Justin Goh/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "AI-focused product builder. I love solving problems, and creating problems to solve.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "I also bridge product and engineering, turning user discovery into practical AI systems.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /About/i })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /^Work$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Contact/i }),
    ).toBeInTheDocument();
  });

  it("renders a pulsing NUS BAIS link token in the hero metadata", () => {
    render(<App />);

    const baisLink = screen.getByRole("link", { name: /click me/i });
    expect(baisLink).toHaveAttribute(
      "href",
      "https://www.comp.nus.edu.sg/programmes/ug/bais/",
    );
    expect(baisLink).toHaveAttribute("target", "_blank");
    expect(baisLink).toHaveClass("bais-pulse-token");
    expect(screen.getByText(/NUS Business AI Systems/i)).toHaveClass(
      "hero-meta-primary",
    );
    expect(screen.getByText(/Graduating Dec 2027/i)).toHaveClass(
      "hero-meta-primary",
    );
  });

  it("renders all four open project model stages in order", () => {
    render(<App />);

    expect(screen.queryAllByText(/3D \/ interactive/i)).toHaveLength(0);
    expect(screen.getAllByText(/drag to rotate/i)).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "Grounded" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Claim Integrity Agent" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "LutherAIBot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AuroraMart" }),
    ).toBeInTheDocument();
  });

  it("constrains project model dragging to left-right rotation only", async () => {
    render(<App />);

    for (const controls of await screen.findAllByTestId("presentation-controls")) {
      expect(controls).toHaveAttribute("data-polar", "[0,0]");
      expect(controls).toHaveAttribute("data-azimuth", "[-0.75,0.75]");
    }
  });

  it("renders project descriptions as short bullet points", () => {
    render(<App />);

    expect(
      screen.getByRole("list", { name: /Grounded highlights/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Scores speech, content, and body-language signals/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: /AuroraMart highlights/i }),
    ).toBeInTheDocument();
  });

  it("renders the requested project links without model captions", () => {
    render(<App />);

    expect(screen.queryByText(/Live Signal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Risk Lattice/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Assistant Core/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Commerce Graph/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View build/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Discovery notes/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Live app/i })).toHaveAttribute(
      "href",
      "https://groundedinterviews.com",
    );
    expect(screen.getByRole("link", { name: /Website/i })).toHaveAttribute(
      "href",
      "https://lutheraibot.com",
    );
    expect(screen.getByRole("link", { name: /OpenClaw/i })).toHaveAttribute(
      "href",
      "https://openclaw.ai/",
    );
  });

  it("surfaces skills and certifications in a categorized atlas", () => {
    render(<App />);

    expect(screen.queryByLabelText(/Skills and certifications/i)).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Skill map/i })).toBeInTheDocument();
    const skillHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(skillHeadings[0]).toHaveTextContent("Credentials");
    expect(
      screen.getByRole("img", { name: /IBM Product Management/i }),
    ).toHaveAttribute("src", "/images/IBM-PM-cert.png");
    expect(
      screen.getByRole("img", { name: /Google AI Professional/i }),
    ).toHaveAttribute("src", "/images/google-ai-professional.png");
    expect(
      screen.getByRole("img", { name: /NUS Product Club/i }),
    ).toHaveAttribute("src", "/images/NUS-product-club.png");
    const credentials = screen
      .getByRole("heading", { name: /Credentials/i })
      .closest("article");
    expect(credentials).not.toBeNull();
    expect(within(credentials as HTMLElement).queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByText("IBM Product Management â€” Professional Certification"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Google AI â€” Professional Certification"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("NUS Product Club â€” Member")).not.toBeInTheDocument();
    const productJudgment = screen
      .getByRole("heading", { name: /Product judgment/i })
      .closest("article");
    expect(productJudgment).not.toBeNull();
    expect(
      within(productJudgment as HTMLElement).getByText("Product Management essential skills"),
    ).toBeInTheDocument();
    for (const skill of [
      "Agile / Scrum Methods",
      "Product Market Research",
      "User Acceptance Testing",
      "UI / UX Design",
      "Roadmapping",
      "QoE Benchmarking",
    ]) {
      expect(within(productJudgment as HTMLElement).getByText(skill)).toBeInTheDocument();
    }
    for (const removedSkill of [
      "Product Discovery",
      "User Research",
      "First-Principles Scoping",
      "Build-vs-Buy Analysis",
    ]) {
      expect(
        within(productJudgment as HTMLElement).queryByText(removedSkill),
      ).not.toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: /AI systems/i })).toBeInTheDocument();
    const aiSystems = screen
      .getByRole("heading", { name: /AI systems/i })
      .closest("article");
    expect(aiSystems).not.toBeNull();
    expect(screen.getAllByText("Claude Code").length).toBeGreaterThan(0);
    expect(screen.getAllByText("OpenAI Codex").length).toBeGreaterThan(0);
    expect(screen.getByText("MCP")).toBeInTheDocument();
    expect(screen.getByText("Agent Development")).toBeInTheDocument();
    expect(screen.getByText("AI-Native Engineering")).toBeInTheDocument();
    expect(
      within(aiSystems as HTMLElement).queryByText("OpenAI Vision"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Claude Code logo/i }),
    ).toHaveAttribute("src", "/images/claude-code-logo.png");
    expect(
      screen.getByRole("img", { name: /OpenAI Codex logo/i }),
    ).toHaveAttribute("src", "/images/openai-codex-logo.png");
    expect(
      screen.getByRole("img", { name: /Django logo/i }),
    ).toHaveAttribute("src", "/images/django-logo.png");
    expect(
      screen.getByRole("img", { name: /Flask logo/i }),
    ).toHaveAttribute("src", "/images/flask-logo.png");
    expect(
      screen.getByRole("img", { name: /Java logo/i }),
    ).toHaveAttribute("src", "/images/java-logo.png");
    expect(
      screen.getByRole("img", { name: /Python logo/i }),
    ).toHaveAttribute("src", "/images/python-logo.png");
    expect(
      screen.getByRole("img", { name: /React logo/i }),
    ).toHaveAttribute("src", "/images/react-logo.png");
    expect(
      screen.getByRole("img", { name: /TypeScript logo/i }),
    ).toHaveAttribute("src", "/images/typescript-logo.png");
    expect(
      screen.getByRole("img", { name: /Tableau logo/i }),
    ).toHaveAttribute("src", "/images/tableau-logo.png");
    expect(
      screen.getByRole("img", { name: "SQL logo" }),
    ).toHaveAttribute("src", "/images/sql-logo.jpg");
    expect(
      screen.getByRole("img", { name: /Oracle APEX logo/i }),
    ).toHaveAttribute("src", "/images/oracle-apex-logo.jpg");
    expect(
      screen.getByRole("img", { name: "Oracle PL/SQL logo" }),
    ).toHaveAttribute("src", "/images/plsql-logo.jpg");
    expect(
      screen.getByRole("img", { name: /Docker logo/i }),
    ).toHaveAttribute("src", "/images/docker-logo.png");
    expect(
      screen.getByRole("img", { name: /n8n logo/i }),
    ).toHaveAttribute("src", "/images/n8n-logo.png");
    expect(
      screen.getByRole("img", { name: /Stripe logo/i }),
    ).toHaveAttribute("src", "/images/stripe-logo.svg");
    expect(
      screen.getByRole("img", { name: /Railway logo/i }),
    ).toHaveAttribute("src", "/images/railway-logo.svg");
    expect(
      screen.getByRole("img", { name: /Supabase logo/i }),
    ).toHaveAttribute("src", "/images/supabase-logo.png");
    const productEngineering = screen
      .getByRole("heading", { name: /Product engineering/i })
      .closest("article");
    expect(productEngineering).not.toBeNull();
    expect(within(productEngineering as HTMLElement).queryByRole("list")).not.toBeInTheDocument();
    for (const duplicateSkill of ["React", "TypeScript", "Flask", "Django", "Java", "Python"]) {
      expect(within(productEngineering as HTMLElement).getByText(duplicateSkill)).toBeInTheDocument();
    }
    const dataFluency = screen
      .getByRole("heading", { name: /Data fluency/i })
      .closest("article");
    expect(dataFluency).not.toBeNull();
    expect(
      within(dataFluency as HTMLElement).queryByText("QoE Benchmarking"),
    ).not.toBeInTheDocument();
    const operations = screen
      .getByRole("heading", { name: /Operations/i })
      .closest("article");
    expect(operations).not.toBeNull();
    expect(within(operations as HTMLElement).queryByText("OAuth")).not.toBeInTheDocument();
    expect(within(operations as HTMLElement).queryByText("PDPA")).not.toBeInTheDocument();
    expect(screen.getAllByText(/IBM Product Management/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google AI/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/Discovery interviews, roadmaps/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/External training and product-community/i),
    ).not.toBeInTheDocument();
  });

  it("keeps the primary HR actions obvious", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: /View projects/i }),
    ).toHaveAttribute("href", "#work");

    const resumeLinks = screen.getAllByRole("link", {
      name: /Download resume/i,
    });
    expect(resumeLinks.length).toBeGreaterThan(0);
    for (const link of resumeLinks) {
      expect(link).toHaveAttribute("href", "/JustinGoh_Resume.pdf");
    }

    expect(
      screen.getByRole("link", { name: /Email Justin/i }).getAttribute("href"),
    ).toMatch(/^mailto:justingohzk@gmail\.com/);
  });

  it("opens every outbound or file link in a new tab", () => {
    render(<App />);

    const links = screen.getAllByRole("link");
    const outboundLinks = links.filter((link) => {
      const href = link.getAttribute("href") ?? "";
      return href !== "" && !href.startsWith("#");
    });

    expect(outboundLinks.length).toBeGreaterThan(0);
    for (const link of outboundLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    }
  });

  it("exposes the Projects/Experiences split selector", () => {
    render(<App />);

    expect(
      screen.getByRole("tab", { name: /Projects/i }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("tab", { name: /Experiences/i }),
    ).toBeInTheDocument();
  });

  it("keeps project 3D canvases enabled on coarse-pointer mobile devices", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(pointer: coarse)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);

    await waitFor(() =>
      expect(screen.getAllByTestId("mock-canvas").length).toBeGreaterThanOrEqual(4),
    );
  });

  it("scrolls work selections to the first item in the selected view", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    const scrollTargets: string[] = [];
    const scrollIntoView = vi.fn(function (this: Element) {
      scrollTargets.push((this as HTMLElement).id);
    });
    Element.prototype.scrollIntoView = scrollIntoView;

    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /Experiences/i }));
    await screen.findByRole("tabpanel", { name: /Experiences/i });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollTargets.at(-1)).toBe("experience-0");

    fireEvent.click(screen.getByRole("tab", { name: /Projects/i }));
    await screen.findByRole("tabpanel", { name: /Projects/i });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2));
    expect(scrollTargets.at(-1)).toBe("grounded");
  });

  it("uses the smooth scroll controller on the first work selection click", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    );
    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      window.setTimeout(() => callback(0), 0);
      return 1;
    });
    window.cancelAnimationFrame = vi.fn();

    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: /Experiences/i }));
    await screen.findByRole("tabpanel", { name: /Experiences/i });

    await waitFor(() => expect(lenisMocks.scrollTo).toHaveBeenCalledTimes(1));
    expect(lenisMocks.scrollTo.mock.calls[0][0]).toBe(
      document.getElementById("experience-0"),
    );
  });

  it("scrolls work crosslinks after the next work view has rendered", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    const scrollContexts: string[] = [];
    const scrollIntoView = vi.fn(() => {
      scrollContexts.push(
        screen.getByRole("tabpanel").getAttribute("aria-label") ?? "",
      );
    });
    Element.prototype.scrollIntoView = scrollIntoView;

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /View experiences/i }));
    await screen.findByRole("tabpanel", { name: /Experiences/i });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollContexts.at(-1)).toBe("Experiences");

    fireEvent.click(screen.getByRole("button", { name: /View projects/i }));
    await screen.findByRole("tabpanel", { name: /Projects/i });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2));
    expect(scrollContexts.at(-1)).toBe("Projects");
  });

  it("renders a clickable about slideshow with manual controls", () => {
    render(<App />);

    expect(
      screen.getByRole("img", {
        name: /ShopBack Product Managers x NUS Entrepreneur Society/i,
      }),
    ).toBeInTheDocument();
    expect(document.querySelector(".about-slide-status strong")).toBeNull();
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "ShopBack Product Managers x NUS Entrepreneur Society",
    );

    fireEvent.click(screen.getByRole("button", { name: /Next about image/i }));

    expect(
      screen.getByRole("img", { name: /NUS InterHall Hackathon/i }),
    ).toBeInTheDocument();
    expect(document.querySelector(".about-slide-status strong")).toBeNull();
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "NUS InterHall Hackathon",
    );

    fireEvent.click(screen.getByRole("button", { name: /Previous about image/i }));

    expect(
      screen.getByRole("img", {
        name: /ShopBack Product Managers x NUS Entrepreneur Society/i,
      }),
    ).toBeInTheDocument();
  });
});
