import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

const dreiMocks = vi.hoisted(() => ({
  useGLTF: vi.fn(),
}));
const lenisMocks = vi.hoisted(() => ({
  scrollTo: vi.fn(),
  raf: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: vi.fn(function () {
    return lenisMocks;
  }),
}));

vi.mock("./lib/ktx2", () => ({
  KTX2Support: () => null,
  withKTX2: vi.fn(),
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
      true,
      expect.any(Function),
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

  it("also enters the site from a scroll gesture or the skip button", async () => {
    render(<App />);
    const intro = await screen.findByRole("dialog", { name: /Intro landing/i });

    vi.useFakeTimers();
    fireEvent.wheel(window, { deltaY: 40 });
    expect(intro).toHaveAttribute("data-intro-phase", "pressing");
    act(() => vi.advanceTimersByTime(1200));
    expect(
      screen.queryByRole("dialog", { name: /Intro landing/i }),
    ).not.toBeInTheDocument();

    window.sessionStorage.clear();
    vi.useRealTimers();
    fireEvent.click(screen.getByRole("link", { name: "Replay intro" }));
    fireEvent.click(await screen.findByRole("button", { name: /Skip intro/i }));
    expect(
      screen.queryByRole("dialog", { name: /Intro landing/i }),
    ).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("justin-portfolio-intro-seen")).toBe("true");
  });

  it("keeps fixed navigation outside the transformed portfolio shell", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    render(<App />);

    const shell = document.querySelector(".portfolio-shell");
    for (const selector of [".site-nav", ".scroll-wheel", ".dock-bar"]) {
      const element = document.querySelector(selector);
      expect(element).not.toBeNull();
      expect(shell?.contains(element)).toBe(false);
    }
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

  it("hides the top-nav GitHub link on narrow mobile screens", async () => {
    // @ts-expect-error Node built-in types are not included in the app tsconfig.
    const { readFileSync } = (await import("node:fs")) as {
      readFileSync: (path: string, encoding: string) => string;
    };
    const stylesCss = readFileSync("src/styles.css", "utf8");

    expect(stylesCss).toMatch(
      /@media\s*\(max-width:\s*540px\)\s*{[\s\S]*\.nav-github\s*{[^}]*display:\s*none;/,
    );
  });

  it("shows full-time availability from January 2028", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");

    render(<App />);

    expect(
      screen.getByText("Full-time roles from Jan 2028 / Open to chats now"),
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

    fireEvent.click(screen.getByRole("link", { name: "Replay intro" }));

    return expect(
      screen.findByRole("dialog", { name: /Intro landing/i }),
    ).resolves.toBeInTheDocument();
  });

  it("renders the recruiter-critical portfolio sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /Justin Goh/i, level: 1 }),
    ).toBeInTheDocument();
    expect(document.querySelector(".hero-positioning")).toHaveTextContent(
      "AI-focused product builder. I love solving problems, and creating problems to solve.",
    );
    expect(document.querySelector(".hero-highlight")).toHaveTextContent(
      "AI-focused product builder.",
    );
    expect(
      screen.getByText(
        "I also bridge product and engineering, turning user discovery into practical AI systems.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /About/i })).toBeInTheDocument();
    expect(screen.queryByText("Discovery before code")).not.toBeInTheDocument();
    expect(screen.queryByText("First principles, then depth")).not.toBeInTheDocument();
    expect(screen.queryByText("Ship, then measure")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Experience$/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Projects$/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Toolkit$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Contact/i }),
    ).toBeInTheDocument();
  });

  it("links the NUS BAIS degree and leads the hero with the incoming role", () => {
    render(<App />);

    const baisLink = screen.getByRole("link", { name: /NUS Business AI Systems/i });
    expect(baisLink).toHaveAttribute(
      "href",
      "https://www.comp.nus.edu.sg/programmes/ug/bais/",
    );
    expect(baisLink).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/Graduating Dec 2027/i)).toHaveClass("hero-meta-primary");
    expect(screen.getByRole("list", { name: "Previous roles" })).toHaveTextContent(
      "Product / QoE Research Intern at IMDA",
    );
    expect(
      screen.getByRole("link", {
        name: /Incoming Technical Product Management Intern @ Temasek Holdings/i,
      }),
    ).toHaveAttribute("href", "#experience");
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

  it("surfaces credentials and skills in a compact toolkit", () => {
    render(<App />);

    const toolkit = screen.getByRole("region", { name: /^Toolkit$/i });
    const headings = within(toolkit)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual([
      "Credentials",
      "Product judgment",
      "AI systems",
      "Product engineering",
      "Data fluency",
      "Operations",
    ]);
    expect(
      within(toolkit).getByRole("img", { name: /IBM Product Management/i }),
    ).toHaveAttribute("src", "/images/IBM-PM-cert.webp");
    expect(
      within(toolkit).getByRole("list", { name: "Product judgment skills" }),
    ).toHaveTextContent("QoE Benchmarking");

    const aiSkills = within(toolkit).getByRole("list", { name: "AI systems skills" });
    expect(within(aiSkills).getByText("Claude Code")).toBeInTheDocument();
    expect(within(aiSkills).getByText("OpenAI Codex")).toBeInTheDocument();
    // Logos sit beside their names, so they stay decorative and appear only once.
    expect(within(toolkit).getAllByText("Claude Code")).toHaveLength(1);
    expect(within(toolkit).queryByRole("img", { name: /React logo/i })).toBeNull();
  });

  it("keeps the primary HR actions obvious", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: /View projects/i }),
    ).toHaveAttribute("href", "#projects");
    expect(
      screen.getByRole("link", { name: /View experience/i }),
    ).toHaveAttribute("href", "#experience");

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
    // mailto: hands off to the mail client, so a new tab would just be left blank.
    const outboundLinks = links.filter((link) => {
      const href = link.getAttribute("href") ?? "";
      return href !== "" && !href.startsWith("#") && !href.startsWith("mailto:");
    });

    expect(outboundLinks.length).toBeGreaterThan(0);
    for (const link of outboundLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    }
  });

  it("shows experience before projects without a tab switch", () => {
    render(<App />);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    const experienceSection = screen.getByRole("region", { name: /^Experience$/i });
    const projectsSection = screen.getByRole("region", { name: /^Projects$/i });
    expect(
      experienceSection.compareDocumentPosition(projectsSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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

  it("scrolls in-page links to their section", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    const scrollTargets: string[] = [];
    Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
      scrollTargets.push((this as HTMLElement).id);
    });

    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /View experience/i }));
    expect(scrollTargets.at(-1)).toBe("experience");

    fireEvent.click(screen.getByRole("link", { name: /View projects/i }));
    expect(scrollTargets.at(-1)).toBe("projects");
  });

  it("uses the smooth scroll controller for in-page links", async () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(function () {
        return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
      }),
    );
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();

    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /View experience/i }));

    await waitFor(() => expect(lenisMocks.scrollTo).toHaveBeenCalledTimes(1));
    expect(lenisMocks.scrollTo.mock.calls[0][0]).toBe(
      document.getElementById("experience"),
    );
  });

  it("renders a clickable about slideshow with manual controls", () => {
    render(<App />);

    expect(
      screen.getByRole("img", {
        name: /QoE product management and research internship/i,
      }),
    ).toBeInTheDocument();
    expect(document.querySelector(".about-slide-status strong")).toBeNull();
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "QoE Product Management and Research Internship @ IMDA",
    );

    fireEvent.click(screen.getByRole("button", { name: /Next about image/i }));

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
    fireEvent.click(screen.getByRole("button", { name: /Next about image/i }));

    expect(
      screen.getByRole("img", { name: /Carousell x OpenAI Hackathon/i }),
    ).toBeInTheDocument();
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "Carousell x OpenAI Hackathon",
    );

    fireEvent.click(screen.getByRole("button", { name: /Previous about image/i }));

    expect(
      screen.getByRole("img", { name: /Regional Codex Hackathon/i }),
    ).toBeInTheDocument();
  });

  it("restarts the about auto-advance countdown after an arrow click", () => {
    vi.useFakeTimers();
    render(<App />);

    act(() => vi.advanceTimersByTime(9_900));
    fireEvent.click(screen.getByRole("button", { name: /Next about image/i }));

    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "ShopBack Product Managers x NUS Entrepreneur Society",
    );

    act(() => vi.advanceTimersByTime(200));
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "ShopBack Product Managers x NUS Entrepreneur Society",
    );

    act(() => vi.advanceTimersByTime(9_800));
    expect(document.querySelector(".about-caption")).toHaveTextContent(
      "Regional Codex Hackathon",
    );
  });

  it("renders the Temasek Holdings experience and company logo rail", () => {
    window.sessionStorage.setItem("justin-portfolio-intro-seen", "true");
    render(<App />);

    const experienceSection = screen.getByRole("region", { name: /^Experience$/i });
    expect(
      within(experienceSection).getByRole("heading", {
        name: "Real Contributions in Real Companies",
      }),
    ).toBeInTheDocument();
    expect(
      within(experienceSection).getByRole("heading", {
        name: "Technical Product Management Intern",
      }),
    ).toBeInTheDocument();
    expect(within(experienceSection).getByText("Incoming")).toBeInTheDocument();
    expect(within(experienceSection).getByText("Jan 2027 - Jun 2027")).toBeInTheDocument();
    expect(
      within(experienceSection).getByRole("img", { name: "Temasek Holdings logo" }),
    ).toHaveAttribute("src", "/images/temasek-holdings-logo.webp");
    expect(document.querySelectorAll(".timeline-logo-frame img")).toHaveLength(4);
  });
});
