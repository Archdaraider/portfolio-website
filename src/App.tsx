import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import {
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
  experience,
  marquee,
  profile,
  projects,
  skillGroups,
  type Project,
} from "./data/portfolio";

const ModelCanvas = lazy(() => import("./components/ModelCanvas"));
const IntroGate = lazy(() => import("./components/IntroGate"));

type WorkView = "projects" | "experience";
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
const NUS_BAIS_HREF = "https://www.comp.nus.edu.sg/programmes/ug/bais/";

function App() {
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [workView, setWorkView] = useState<WorkView>("projects");
  const [pendingWorkScrollTarget, setPendingWorkScrollTarget] =
    useState<WorkView | null>(null);
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
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.25,
  });

  useScrollReveal(prefersReducedMotion, workView);

  useEffect(() => {
    if (pendingWorkScrollTarget !== workView) {
      return;
    }

    let frame = 0;
    let timer = 0;
    let didScroll = false;
    const targetId = getWorkViewTargetId(pendingWorkScrollTarget);
    const scrollToSelectedWork = () => {
      if (didScroll) {
        return;
      }
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      didScroll = true;
      if (lenisRef.current && !prefersReducedMotion) {
        lenisRef.current.scrollTo(target, { offset: -96, duration: 1.05 });
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
      window.setTimeout(() => setPendingWorkScrollTarget(null), 0);
    };

    if (typeof window.requestAnimationFrame === "function") {
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(scrollToSelectedWork);
      });
      timer = window.setTimeout(scrollToSelectedWork, 180);
      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      };
    }

    timer = window.setTimeout(scrollToSelectedWork, 0);
    return () => window.clearTimeout(timer);
  }, [pendingWorkScrollTarget, prefersReducedMotion, workView]);

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

  const enterSite = () => {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    setIntroComplete(true);
    setShowIntro(false);
    scrollToTop(prefersReducedMotion);
  };

  const reopenIntro = () => {
    scrollToTop(prefersReducedMotion);
    setIntroComplete(false);
    setShowIntro(true);
  };

  const selectWork = (view: WorkView) => {
    setWorkView(view);
    setPendingWorkScrollTarget(view);
  };

  return (
    <main>
      <Suspense fallback={null}>
        <IntroGate
          key={showIntro ? "intro-open" : "intro-closed"}
          isVisible={showIntro}
          onEnter={enterSite}
        />
      </Suspense>
      <div
        className={`portfolio-shell ${
          introComplete ? "is-intro-complete" : "is-intro-active"
        }`}
      >
        <ScrollWheel progress={progress} />
        <SiteNav onSelectWork={selectWork} onOpenIntro={reopenIntro} />
        <Hero onSelectWork={selectWork} />
        <SkillAtlas />
        <About />
        <Work view={workView} onSelect={selectWork} />
        <Contact />
        <DockBar />
      </div>
    </main>
  );
}

function scrollToTop(prefersReducedMotion: boolean | null) {
  if (
    typeof window.scrollTo !== "function" ||
    navigator.userAgent.toLowerCase().includes("jsdom")
  ) {
    return;
  }

  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function getWorkViewTargetId(view: WorkView) {
  return view === "projects" ? projects[0]?.id ?? "work" : "experience-0";
}

function useScrollReveal(prefersReducedMotion: boolean | null, workView: WorkView) {
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
  }, [prefersReducedMotion, workView]);
}

function ScrollWheel({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [percent, setPercent] = useState(0);
  const [marks, setMarks] = useState<{ id: string; label: string; frac: number }[]>(
    [],
  );
  const knobY = useTransform(progress, [0, 1], ["0%", "100%"]);
  const fillScaleY = useTransform(progress, (v) => Math.max(0, Math.min(1, v)));

  useMotionValueEvent(progress, "change", (value) => {
    setPercent(Math.round(Math.max(0, Math.min(1, value)) * 100));
  });

  useEffect(() => {
    const sections = [
      { id: "top", label: "Intro" },
      { id: "about", label: "About" },
      { id: "work", label: "Work" },
      { id: "contact", label: "Contact" },
    ];

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = sections
        .map(({ id, label }) => {
          const el = document.getElementById(id);
          if (!el) return null;
          const frac = max > 0 ? Math.min(1, el.offsetTop / max) : 0;
          return { id, label, frac };
        })
        .filter((m): m is { id: string; label: string; frac: number } => m !== null);
      setMarks(next);
    };

    measure();
    window.addEventListener("resize", measure);
    const timer = window.setTimeout(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(timer);
    };
  }, []);

  const scrollToFraction = (frac: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: frac * max, behavior: "smooth" });
  };

  const handleRailClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    scrollToFraction(frac);
  };

  return (
    <aside className="scroll-wheel" aria-label="Scroll progress and section navigation">
      <span className="scroll-wheel-arrow" aria-hidden="true">
        ↑
      </span>
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
            className="scroll-wheel-mark"
            style={{ top: `${mark.frac * 100}%` }}
            aria-label={`Go to ${mark.label}`}
            onClick={(event) => {
              event.stopPropagation();
              document
                .getElementById(mark.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <span className="scroll-wheel-knob-count">{percent}</span>
        </motion.span>
      </div>
      <span className="scroll-wheel-arrow" aria-hidden="true">
        ↓
      </span>
      <span className="scroll-wheel-label" aria-hidden="true">
        scroll
      </span>
    </aside>
  );
}

function SiteNav({
  onSelectWork,
  onOpenIntro,
}: {
  onSelectWork: (view: WorkView) => void;
  onOpenIntro: () => void;
}) {
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a
        href="#top"
        className="nav-mark magnetic"
        onClick={(event) => {
          event.preventDefault();
          onOpenIntro();
        }}
      >
        J
      </a>
      <div className="nav-links">
        <a href="#about" className="magnetic">
          About
        </a>
        <a
          href="#work"
          className="magnetic"
          onClick={(event) => {
            event.preventDefault();
            onSelectWork("projects");
          }}
        >
          Projects
        </a>
        <a
          href="#work"
          className="magnetic"
          onClick={(event) => {
            event.preventDefault();
            onSelectWork("experience");
          }}
        >
          Experience
        </a>
        <a href="#contact" className="magnetic">
          Contact
        </a>
        <span className="nav-divider" aria-hidden="true" />
        <a
          href={contact.linkedIn}
          className="magnetic"
          {...NEW_TAB_LINK_PROPS}
        >
          LinkedIn
        </a>
        <a
          href={contact.github}
          className="magnetic nav-github"
          {...NEW_TAB_LINK_PROPS}
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

function Hero({ onSelectWork }: { onSelectWork: (view: WorkView) => void }) {
  return (
    <section id="top" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-meta reveal reveal-left">
        <p className="hero-meta-primary">
          <a
            href={NUS_BAIS_HREF}
            className="bais-pulse-token magnetic"
            {...NEW_TAB_LINK_PROPS}
          >
            click me
          </a>
          {profile.eyebrow}
        </p>
        <p className="hero-meta-primary">{profile.graduation}</p>
        <div className="meta-rule" />
        <ul className="hero-role-list" aria-label="Current roles">
          {profile.heroMetrics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="hero-copy reveal">
        <p className="eyebrow">Portfolio</p>
        <h1 id="hero-title">{profile.name}</h1>
        <p className="hero-positioning">{profile.positioning}</p>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a
            href="#work"
            className="button primary magnetic"
            onClick={(event) => {
              event.preventDefault();
              onSelectWork("projects");
            }}
          >
            <span>View projects</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
          <a
            href="#work"
            className="button secondary magnetic"
            onClick={(event) => {
              event.preventDefault();
              onSelectWork("experience");
            }}
          >
            <span>View experiences</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
        </div>
      </div>
      <div className="hero-visual shell-card reveal reveal-right">
        <div className="hero-visual-inner">
          <img
            className="hero-portrait"
            src={profile.portraitImage}
            alt="Justin Goh"
            fetchPriority="high"
          />
          <div className="orbital-note">Singapore / building in the open</div>
        </div>
      </div>
    </section>
  );
}

export function Marquee({ large = false }: { large?: boolean }) {
  const items = [...marquee.skills, ...marquee.certifications];
  const loop = [...items, ...items];

  return (
    <section
      className={`marquee reveal ${large ? "is-large" : ""}`}
      aria-label="Skills and certifications"
    >
      <div className="marquee-track">
        {loop.map((item, index) => {
          const isCert = marquee.certifications.includes(item);
          return (
            <span
              key={`${item}-${index}`}
              className={`marquee-item ${isCert ? "is-cert" : ""}`}
            >
              {isCert ? <span className="marquee-star">✦</span> : null}
              {item}
              <span className="marquee-sep" aria-hidden="true">
                /
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

function SkillAtlas() {
  return (
    <section
      id="skills"
      className="skill-atlas section-shell"
      aria-label="Skill map"
    >
      <div className="section-index reveal reveal-left">Skills</div>
      <div className="skill-atlas-intro reveal">
        <p className="eyebrow">Capability map</p>
        <h2>What I bring into a room.</h2>
        <p>
          A recruiter-friendly view of the same stack: product judgment first,
          then the technical surface area that lets the work ship.
        </p>
      </div>
      <div className="skill-atlas-board reveal reveal-right">
        {skillGroups.map((group, index) => {
          const logos = group.credentials ?? group.logos ?? [];
          const logoTitles = new Set(logos.map((logo) => logo.title));
          const visibleSkills = group.credentials
            ? []
            : group.skills.filter((skill) => !logoTitles.has(skill));

          return (
            <article className="skill-lane" key={group.title}>
              <div className="skill-lane-head">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{group.title}</h3>
                <p>{group.signal}</p>
              </div>
              {logos.length > 0 ? (
                <div className="credential-logo-grid" aria-label={`${group.title} logos`}>
                  {logos.map((logo) => (
                    <figure className="credential-logo-card" key={logo.title}>
                      <img src={logo.image} alt={logo.alt} />
                      <figcaption>{logo.title}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
              {visibleSkills.length > 0 ? (
                <ul className="skill-chip-list" aria-label={`${group.title} skills`}>
                  {visibleSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about section-shell" aria-label="About">
      <div className="section-index reveal reveal-left">01 / About</div>
      <div className="about-copy reveal">
        <p className="eyebrow">Operating notes</p>
        <h2 id="about-title">The best product people are builders.</h2>
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
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = aboutSlides[activeSlide];

  const showSlide = (direction: 1 | -1) => {
    setActiveSlide((current) =>
      (current + direction + aboutSlides.length) % aboutSlides.length,
    );
  };

  useEffect(() => {
    const timer = window.setInterval(() => showSlide(1), 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <figure className="about-visual shell-card reveal reveal-right">
      <button
        type="button"
        className="about-image about-slide-hit"
        aria-label={`Advance about slideshow from ${slide.title}`}
        onClick={() => showSlide(1)}
      >
        <img src={slide.image} alt={slide.alt} style={{ objectPosition: slide.objectPosition }} loading="lazy" />
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
        <div className="about-slide-status" aria-live="polite">
          <span>{String(activeSlide + 1).padStart(2, "0")}</span>
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
      <figcaption className="about-caption">{slide.title}</figcaption>
    </figure>
  );
}

function Work({
  view,
  onSelect,
}: {
  view: WorkView;
  onSelect: (view: WorkView) => void;
}) {
  return (
    <section id="work" className="work" aria-label="Work">
      <div className="work-head section-shell">
        <div className="section-index reveal reveal-left">02 / Work</div>
        <div className="work-intro reveal">
          <p className="eyebrow">Choose a path</p>
          <h2 id="work-title">Two ways in.</h2>
          <p>
            Pick a branch: the things I&apos;ve built, or the rooms I&apos;ve built
            them in. You can switch anytime.
          </p>
        </div>
        <div
          className="work-split reveal"
          role="tablist"
          aria-label="Work view selector"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "projects"}
            className={`work-path ${view === "projects" ? "is-active" : ""}`}
            onClick={() => onSelect("projects")}
          >
            <span className="work-path-node">A</span>
            <h3>Projects</h3>
            <p>Real builds, each with its own object lesson.</p>
            <span className="work-path-meta">
              {String(projects.length).padStart(2, "0")} builds ↘
            </span>
          </button>
          <span className="work-split-fork" aria-hidden="true" />
          <button
            type="button"
            role="tab"
            aria-selected={view === "experience"}
            className={`work-path ${view === "experience" ? "is-active" : ""}`}
            onClick={() => onSelect("experience")}
          >
            <span className="work-path-node">B</span>
            <h3>Experiences</h3>
            <p>The roles where the useful constraints showed up.</p>
            <span className="work-path-meta">
              {String(experience.length).padStart(2, "0")} roles ↘
            </span>
          </button>
        </div>
      </div>

      {view === "projects" ? (
        <div className="work-view" role="tabpanel" aria-label="Projects">
          {projects.map((project, index) => (
            <ProjectPanel key={project.id} project={project} index={index} />
          ))}
          <WorkCrosslink
            eyebrow="Don’t stop here"
            heading="Now see the rooms these were built in."
            action="View experiences"
            onClick={() => onSelect("experience")}
          />
        </div>
      ) : (
        <div className="work-view" role="tabpanel" aria-label="Experiences">
          <div className="experience section-shell">
            <div className="reveal">
              <p className="eyebrow">Experience</p>
              <h2 id="experience-title">A short record of useful constraints.</h2>
            </div>
            <div className="timeline">
              {experience.map((item, index) => (
                <article
                  id={index === 0 ? "experience-0" : undefined}
                  className="timeline-item reveal"
                  key={`${item.role}-${item.organisation}`}
                >
                  <span>{item.period}</span>
                  <div>
                    <h3>{item.role}</h3>
                    <p className="timeline-org">{item.organisation}</p>
                    <p>{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <WorkCrosslink
            eyebrow="Don’t stop here"
            heading="Circle back to the things I’ve built."
            action="View projects"
            onClick={() => onSelect("projects")}
          />
        </div>
      )}
    </section>
  );
}

function WorkCrosslink({
  eyebrow,
  heading,
  action,
  onClick,
}: {
  eyebrow: string;
  heading: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="work-crosslink section-shell">
      <div className="work-crosslink-inner reveal">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{heading}</h3>
        <button type="button" className="button primary magnetic" onClick={onClick}>
          <span>{action}</span>
          <span aria-hidden="true" className="button-mark">
            ↗
          </span>
        </button>
      </div>
    </div>
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
        <p className="eyebrow">{String(index + 1).padStart(2, "0")} / Project</p>
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
        <LazyModelCanvas project={project} index={index} />
      </div>
    </article>
  );
}

function LazyModelCanvas({ project, index }: { project: Project; index: number }) {
  return (
    <div className="model-stage">
      <Suspense
        fallback={
          <img
            className="model-fallback"
            src={project.fallbackImage}
            alt={`${project.title} placeholder render`}
          />
        }
      >
        <ModelCanvas project={project} index={index} />
      </Suspense>
      <span className="model-hint" aria-hidden="true">
        drag to rotate · click to open ↗
      </span>
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact section-shell" aria-label="Contact">
      <div className="contact-meta reveal reveal-left">
        <p>Availability</p>
        <strong>2027 January / Internships / Full-Time</strong>
        <p>Location</p>
        <strong>Singapore / remote</strong>
      </div>
      <div className="contact-copy reveal">
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title">Let’s build something robust.</h2>
        <p>
          Send a defined problem, an ambitious idea, or a messy system that
          needs a calmer shape. I respond well to specificity and mildly
          unreasonable goals.
        </p>
        <div className="contact-actions">
          <a href={EMAIL_HREF} className="button primary magnetic" {...NEW_TAB_LINK_PROPS}>
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

function DockBar() {
  return (
    <div className="dock-bar" aria-label="Quick actions">
      <a href={EMAIL_HREF} className="dock-button is-primary" {...NEW_TAB_LINK_PROPS}>
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
