import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const dreiMocks = vi.hoisted(() => ({
  useGLTF: vi.fn(),
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
      "https://getgrounded.com",
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

  it("surfaces certifications in the marquee", () => {
    render(<App />);

    expect(
      screen.getAllByText(/IBM Product Management/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google AI/i).length).toBeGreaterThan(0);
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
