import {
  Suspense,
  lazy,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Lenis from "lenis";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  aboutSlides,
  contact,
  credentials,
  experience,
  profile,
  projects,
  skillGroups,
  stats,
  type ExperienceItem,
  type Project,
  type Stat,
} from "./data/portfolio";

const ModelCanvas = lazy(() => import("./components/ModelCanvas"));
const IntroGate = lazy(() => import("./components/IntroGate"));

const INTRO_SESSION_KEY = "justin-portfolio-intro-seen";

const EMAIL_HREF = `mailto:${contact.email}?subject=${encodeURIComponent(
  "Let's build something",
)}&body=${encodeURIComponent(
  "Hi Justin,\n\nI came across your portfolio and wanted to reach out about ",
)}`;
const NEW_TAB_LINK_PROPS = {
  target: "_blank",
  rel: "noreferrer",
};
const ABOUT_AUTO_ADVANCE_MS = 10_000;
const NAV_OFFSET = -96;

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Toolkit" },
  { id: "contact", label: "Contact" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

const NAV_SECTIONS: SectionId[] = ["experience", "projects", "about", "contact"];
const nextRole = experience.find((item) => item.status);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function sectionLabel(id: SectionId) {
  return SECTIONS.find((section) => section.id === id)?.label ?? "";
}

function App() {
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) !== "true";
  });
  const [introComplete, setIntroComplete] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  });
  const activeSection = useActiveSection();

  useScrollReveal(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion || typeof ResizeObserver === "undefined") {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  // Hold the page still behind the intro so a scroll gesture only presses the key.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) {
      return;
    }
    if (showIntro) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [showIntro, prefersReducedMotion]);

  const scrollToTarget = (target: string | number) => {
    const lenis = prefersReducedMotion ? null : lenisRef.current;
    if (typeof target === "number") {
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.05 });
      } else {
        window.scrollTo?.({ top: target, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
      return;
    }

    const element = document.getElementById(target);
    if (!element) {
      return;
    }
    if (lenis) {
      lenis.scrollTo(element, { offset: target === "top" ? 0 : NAV_OFFSET, duration: 1.05 });
    } else {
      element.scrollIntoView?.({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  // Route every in-page "#section" link through the smooth scroller.
  const onAnchorClick = useEffectEvent((event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const id = link?.getAttribute("href")?.slice(1);
    if (!id || !document.getElementById(id)) {
      return;
    }
    event.preventDefault();
    scrollToTarget(id);
  });

  useEffect(() => {
    const listener = (event: MouseEvent) => onAnchorClick(event);
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, []);

  const jumpToTop = () => {
    if (navigator.userAgent.toLowerCase().includes("jsdom")) {
      return;
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const enterSite = () => {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    jumpToTop();
    setIntroComplete(true);
    setShowIntro(false);
  };

  const reopenIntro = () => {
    jumpToTop();
    setIntroComplete(false);
    setShowIntro(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Suspense fallback={null}>
          <IntroGate
            key={showIntro ? "intro-open" : "intro-closed"}
            isVisible={showIntro}
            onEnter={enterSite}
          />
        </Suspense>
        {/* Fixed chrome lives outside the animated shell: a transformed ancestor
            would otherwise turn position: fixed into position: absolute. */}
        <div className={`site-chrome ${introComplete ? "" : "is-hidden"}`}>
          <SiteNav activeSection={activeSection} onOpenIntro={reopenIntro} />
          <ScrollWheel activeSection={activeSection} onNavigate={scrollToTarget} />
          <DockBar isHidden={activeSection === "contact"} />
        </div>
        <div
          className={`portfolio-shell ${
            introComplete ? "is-intro-complete" : "is-intro-active"
          }`}
        >
          <Hero />
          <ProofStrip />
          <Experience />
          <Projects />
          <About />
          <Toolkit />
          <Contact />
        </div>
      </main>
    </MotionConfig>
  );
}

function useActiveSection(): SectionId {
  const [activeSection, setActiveSection] = useState<SectionId>("top");
  const { scrollY } = useScroll();

  const measure = () => {
    if (typeof window === "undefined") {
      return;
    }
    const probe = window.innerHeight * 0.4;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 &&
      window.scrollY > 0;
    let current: SectionId = "top";
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= probe) {
        current = id;
      }
    }
    setActiveSection(atBottom ? "contact" : current);
  };

  useMotionValueEvent(scrollY, "change", measure);
  return activeSection;
}

function useScrollReveal(prefersReducedMotion: boolean | null) {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (revealElements.length === 0) {
      return;
    }

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.16,
      },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);
}

function useInViewOnce(ref: React.RefObject<Element | null>) {
  const [isInView, setIsInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}

function ScrollWheel({
  activeSection,
  onNavigate,
}: {
  activeSection: SectionId;
  onNavigate: (target: string | number) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [marks, setMarks] = useState<{ id: SectionId; label: string; frac: number }[]>(
    [],
  );
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.25,
  });
  const knobY = useTransform(progress, [0, 1], ["0%", "100%"]);
  const fillScaleY = useTransform(progress, (v) => Math.max(0, Math.min(1, v)));

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setMarks(
        SECTIONS.flatMap(({ id, label }) => {
          const element = document.getElementById(id);
          if (!element) return [];
          const top = element.getBoundingClientRect().top + window.scrollY;
          return [{ id, label, frac: max > 0 ? Math.min(1, Math.max(0, top / max)) : 0 }];
        }),
      );
    };

    measure();
    // Sections grow as models and images load, so keep the marks in sync.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handleRailClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    onNavigate(frac * (document.documentElement.scrollHeight - window.innerHeight));
  };

  return (
    <aside className="scroll-wheel" aria-label="Section navigation">
      <div className="scroll-wheel-rail" ref={railRef} onClick={handleRailClick}>
        <span className="scroll-wheel-dots" aria-hidden="true" />
        <motion.span
          className="scroll-wheel-fill"
          style={{ scaleY: fillScaleY }}
          aria-hidden="true"
        />
        {marks.map((mark) => (
          <button
            key={mark.id}
            type="button"
            className={`scroll-wheel-mark ${mark.id === activeSection ? "is-active" : ""}`}
            style={{ top: `${mark.frac * 100}%` }}
            aria-label={`Go to ${mark.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(mark.id);
            }}
          >
            <span className="scroll-wheel-mark-label">{mark.label}</span>
          </button>
        ))}
        <motion.span
          className="scroll-wheel-knob"
          style={{ top: knobY }}
          aria-hidden="true"
        >
          <span className="scroll-wheel-knob-label">{sectionLabel(activeSection)}</span>
        </motion.span>
      </div>
    </aside>
  );
}

function SiteNav({
  activeSection,
  onOpenIntro,
}: {
  activeSection: SectionId;
  onOpenIntro: () => void;
}) {
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a
        href="#top"
        className="nav-mark magnetic"
        aria-label="Replay intro"
        title="Replay intro"
        onClick={(event) => {
          event.preventDefault();
          onOpenIntro();
        }}
      >
        J
      </a>
      <div className="nav-links">
        {NAV_SECTIONS.map((id) => {
          const isActive = activeSection === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className={`magnetic ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "location" : undefined}
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-pill"
                  className="nav-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              ) : null}
              {sectionLabel(id)}
            </a>
          );
        })}
        <span className="nav-divider" aria-hidden="true" />
        <a href={contact.linkedIn} className="magnetic" {...NEW_TAB_LINK_PROPS}>
          LinkedIn
        </a>
        <a href={contact.github} className="magnetic nav-github" {...NEW_TAB_LINK_PROPS}>
          GitHub
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const portraitY = useTransform(scrollY, [0, 900], ["-8%", "-1%"]);

  return (
    <section id="top" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-meta reveal reveal-left">
        <p className="hero-meta-primary">
          <a href={profile.degreeHref} className="hero-degree-link" {...NEW_TAB_LINK_PROPS}>
            {profile.degree}
            <span aria-hidden="true"> ↗</span>
          </a>
        </p>
        <p className="hero-meta-primary">{profile.year}</p>
        <p className="hero-meta-primary">{profile.graduation}</p>
        <div className="meta-rule" />
        <p className="hero-meta-label">Previously</p>
        <ul className="hero-role-list" aria-label="Previous roles">
          {profile.previousRoles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="hero-copy reveal">
        {nextRole ? (
          <a href="#experience" className="status-pill">
            <span className="status-dot" aria-hidden="true" />
            <span>{nextRole.status}</span>{" "}
            <span className="status-pill-text">
              {nextRole.role} @ {nextRole.organisation}
            </span>
          </a>
        ) : null}
        <h1 id="hero-title" className="hero-title" aria-label={profile.name}>
          {profile.name.split(" ").map((word, index) => (
            <span className="hero-title-word" key={word} aria-hidden="true">
              <span style={{ "--i": index } as CSSProperties}>{word}</span>
            </span>
          ))}
        </h1>
        <p className="hero-positioning">{profile.positioning}</p>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a href="#projects" className="button primary magnetic">
            <span>View projects</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
          <a href="#experience" className="button secondary magnetic">
            <span>View experience</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
        </div>
      </div>
      <div className="hero-visual shell-card reveal reveal-right">
        <div className="hero-visual-inner">
          <motion.img
            className="hero-portrait"
            src={profile.portraitImage}
            alt="Justin Goh"
            width={778}
            height={1100}
            fetchPriority="high"
            style={prefersReducedMotion ? undefined : { y: portraitY }}
          />
          <div className="orbital-note">Singapore / building in the open</div>
        </div>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="proof-strip section-shell" aria-label="Impact highlights">
      <ul className="proof-grid reveal">
        {stats.map((stat) => (
          <StatTile key={stat.label} stat={stat} />
        ))}
      </ul>
    </section>
  );
}

function StatTile({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLLIElement | null>(null);
  const isInView = useInViewOnce(ref);
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.4,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (value) => setCount(Math.round(value)),
    });
    return () => controls.stop();
  }, [isInView, prefersReducedMotion, stat.value]);

  const shown = prefersReducedMotion ? stat.value : count;
  const fullValue = `${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`;

  return (
    <li ref={ref} className="proof-item">
      <strong className="proof-value" aria-hidden="true">
        {stat.prefix}
        {shown}
        {stat.suffix}
      </strong>
      <span className="sr-only">{fullValue}</span>
      <span className="proof-label">{stat.label}</span>
      <span className="proof-source">{stat.source}</span>
    </li>
  );
}

function Experience() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 55%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  return (
    <section id="experience" className="experience section-shell" aria-label="Experience">
      <div className="section-index reveal reveal-left">01 / Experience</div>
      <div className="section-head reveal">
        <p className="eyebrow">Where the useful constraints showed up</p>
        <h2 id="experience-title" className="section-title">
          Real Contributions in Real Companies
        </h2>
      </div>
      <div className="timeline" ref={timelineRef}>
        <motion.span
          className="timeline-progress"
          style={{ scaleY: lineScale }}
          aria-hidden="true"
        />
        <ol className="timeline-list">
          {experience.map((item) => (
            <TimelineItem key={`${item.role}-${item.organisation}`} item={item} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({ item }: { item: ExperienceItem }) {
  return (
    <li className={`timeline-item reveal ${item.status ? "is-upcoming" : ""}`}>
      <div className="timeline-meta">
        <span className="timeline-period">{item.period}</span>
        <div className="timeline-logo-frame">
          <img src={item.logo} alt={item.logoAlt} loading="lazy" />
        </div>
      </div>
      <div className="timeline-body">
        <span className="timeline-node" aria-hidden="true" />
        <h3>{item.role}</h3>
        <p className="timeline-org">{item.organisation}</p>
        {item.status ? (
          <span className="status-badge">
            <span className="status-dot" aria-hidden="true" />
            {item.status}
          </span>
        ) : null}
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
    </li>
  );
}

function Projects() {
  return (
    <section id="projects" className="projects" aria-label="Projects">
      <div className="projects-head section-shell">
        <div className="section-index reveal reveal-left">02 / Projects</div>
        <div className="section-head reveal">
          <p className="eyebrow">Selected builds</p>
          <h2 id="projects-title" className="section-title">
            Things I&apos;ve built.
          </h2>
          <p className="section-lede">Real builds, each with its own object lesson.</p>
        </div>
      </div>
      {projects.map((project, index) => (
        <ProjectPanel key={project.id} project={project} index={index} />
      ))}
    </section>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  const isReverse = index % 2 === 1;

  return (
    <article
      id={project.id}
      className={`project-panel section-shell ${isReverse ? "is-reverse" : ""}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div
        className={`project-copy reveal ${isReverse ? "reveal-right" : "reveal-left"}`}
      >
        <p className="eyebrow">
          {pad(index + 1)} / {pad(projects.length)}
        </p>
        <h3 id={`${project.id}-title`}>{project.title}</h3>
        <p className="project-hook">{project.hook}</p>
        <ul className="project-impact-list" aria-label={`${project.title} highlights`}>
          {project.impact.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className="stack-list" aria-label={`${project.title} stack`}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="project-links">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-link magnetic"
              {...NEW_TAB_LINK_PROPS}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className={`project-model reveal ${isReverse ? "reveal-left" : "reveal-right"}`}>
        <div className="model-stage">
          <Suspense
            fallback={
              <img
                className="model-fallback"
                src={project.fallbackImage}
                alt={`${project.title} 3D render`}
              />
            }
          >
            <ModelCanvas project={project} index={index} />
          </Suspense>
          <span className="model-hint" aria-hidden="true">
            drag to rotate · click to open ↗
          </span>
        </div>
      </div>
    </article>
  );
}

function About() {
  return (
    <section id="about" className="about section-shell" aria-label="About">
      <div className="section-index reveal reveal-left">03 / About</div>
      <div className="about-copy reveal">
        <p className="eyebrow">Operating notes</p>
        <h2 id="about-title" className="section-title">
          The best product people are builders.
        </h2>
        <p>
          I like messy problems: tinker, find the real constraint, then ship the
          prototype.
        </p>
        <p>
          The best work starts with people: interviews, workflows, and small
          details that become systems that hold up. At NUS, that through-line is
          simple: understand, build, repeat.
        </p>
      </div>
      <AboutSlideshow />
    </section>
  );
}

function AboutSlideshow() {
  const prefersReducedMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoAdvanceCycle, setAutoAdvanceCycle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const remainingMs = useRef(ABOUT_AUTO_ADVANCE_MS);
  const autoAdvance = !prefersReducedMotion;
  const slide = aboutSlides[activeSlide];

  const showSlide = (direction: 1 | -1) => {
    setActiveSlide((current) =>
      (current + direction + aboutSlides.length) % aboutSlides.length,
    );
    setAutoAdvanceCycle((current) => current + 1);
  };

  // Every new slide gets a full countdown; pausing on hover keeps what is left.
  useEffect(() => {
    remainingMs.current = ABOUT_AUTO_ADVANCE_MS;
  }, [autoAdvanceCycle]);

  useEffect(() => {
    if (!autoAdvance || isPaused) {
      return;
    }
    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % aboutSlides.length);
      setAutoAdvanceCycle((current) => current + 1);
    }, remainingMs.current);

    return () => {
      window.clearTimeout(timer);
      remainingMs.current = Math.max(0, remainingMs.current - (Date.now() - startedAt));
    };
  }, [autoAdvance, autoAdvanceCycle, isPaused]);

  return (
    <figure
      className="about-visual shell-card reveal reveal-right"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        type="button"
        className="about-image"
        aria-label={`Advance about slideshow from ${slide.title}`}
        onClick={() => showSlide(1)}
      >
        {aboutSlides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt={item.alt}
            className={index === activeSlide ? "is-active" : ""}
            aria-hidden={index !== activeSlide}
            style={{ objectPosition: item.objectPosition }}
            loading="lazy"
          />
        ))}
      </button>
      <div className="about-slide-controls" aria-label="About image controls">
        <button
          type="button"
          className="about-slide-control"
          aria-label="Previous about image"
          onClick={() => showSlide(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="about-slide-status">
          <span>
            {pad(activeSlide + 1)} / {pad(aboutSlides.length)}
          </span>
          {autoAdvance ? (
            <span className="about-progress" aria-hidden="true">
              <span
                key={autoAdvanceCycle}
                className={`about-progress-fill ${isPaused ? "is-paused" : ""}`}
                style={{ animationDuration: `${ABOUT_AUTO_ADVANCE_MS}ms` }}
              />
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="about-slide-control"
          aria-label="Next about image"
          onClick={() => showSlide(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <figcaption className="about-caption" key={slide.title}>
        {slide.title}
      </figcaption>
    </figure>
  );
}

function Toolkit() {
  return (
    <section id="skills" className="toolkit section-shell" aria-label="Toolkit">
      <div className="section-index reveal reveal-left">04 / Toolkit</div>
      <div className="section-head reveal">
        <p className="eyebrow">Capability map</p>
        <h2 className="section-title">What I bring into a room.</h2>
        <p className="section-lede">
          Product judgment first, then the technical surface area that lets the
          work ship.
        </p>
      </div>
      <div className="toolkit-board">
        <article className="toolkit-row reveal">
          <ToolkitRowHead index={1} title="Credentials" signal="Formal product and AI foundations" />
          <ul className="credential-list" aria-label="Credentials">
            {credentials.map((credential) => (
              <li className="credential-badge" key={credential.title}>
                <img src={credential.image} alt={credential.alt} loading="lazy" />
                <span>{credential.title}</span>
              </li>
            ))}
          </ul>
        </article>
        {skillGroups.map((group, index) => (
          <article className="toolkit-row reveal" key={group.title}>
            <ToolkitRowHead index={index + 2} title={group.title} signal={group.signal} />
            <ul className="skill-chip-list" aria-label={`${group.title} skills`}>
              {group.skills.map((skill) => (
                <li className="skill-chip" key={skill.name}>
                  {skill.logo ? (
                    <img src={skill.logo} alt="" width={20} height={20} loading="lazy" />
                  ) : null}
                  {skill.name}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ToolkitRowHead({
  index,
  title,
  signal,
}: {
  index: number;
  title: string;
  signal: string;
}) {
  return (
    <div className="toolkit-row-head">
      <span>{pad(index)}</span>
      <h3>{title}</h3>
      <p>{signal}</p>
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact section-shell" aria-label="Contact">
      <div className="contact-meta reveal reveal-left">
        <p className="contact-index">05 / Contact</p>
        <p>Availability</p>
        <strong>{contact.availability}</strong>
        <p>Location</p>
        <strong>{contact.location}</strong>
      </div>
      <div className="contact-copy reveal">
        <p className="eyebrow">Get in touch</p>
        <h2 id="contact-title" className="section-title">
          Let’s build something robust.
        </h2>
        <p>
          Send a defined problem, an ambitious idea, or a messy system that
          needs a calmer shape. I respond well to specificity and mildly
          unreasonable goals.
        </p>
        <div className="contact-actions">
          <a href={EMAIL_HREF} className="button primary magnetic">
            <span>Email Justin</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
          <a
            href={contact.resumePath}
            className="button secondary magnetic"
            download
            {...NEW_TAB_LINK_PROPS}
          >
            Download resume
          </a>
        </div>
        <div className="social-links">
          <a href={contact.linkedIn} {...NEW_TAB_LINK_PROPS}>
            LinkedIn
          </a>
          <a href={contact.github} {...NEW_TAB_LINK_PROPS}>
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function DockBar({ isHidden }: { isHidden: boolean }) {
  return (
    <div
      className={`dock-bar ${isHidden ? "is-hidden" : ""}`}
      aria-label="Quick actions"
      inert={isHidden}
    >
      <a href={EMAIL_HREF} className="dock-button is-primary">
        <span className="dock-dot" aria-hidden="true" />
        Contact
      </a>
      <span className="dock-divider" aria-hidden="true" />
      <a
        href={contact.resumePath}
        className="dock-button"
        download
        {...NEW_TAB_LINK_PROPS}
      >
        Download resume
        <span aria-hidden="true" className="dock-arrow">
          ↓
        </span>
      </a>
    </div>
  );
}

export default App;
