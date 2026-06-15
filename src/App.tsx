import { Suspense, lazy, useEffect } from "react";
import Lenis from "lenis";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import {
  aboutPrinciples,
  contact,
  experience,
  profile,
  projects,
  type Project,
} from "./data/portfolio";

const ModelCanvas = lazy(() => import("./components/ModelCanvas"));

function App() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  useEffect(() => {
    if (prefersReducedMotion || typeof ResizeObserver === "undefined") {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <main>
      <motion.div
        aria-hidden="true"
        className="scroll-progress"
        style={{ scaleX: progress }}
      />
      <SiteNav />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </main>
  );
}

function SiteNav() {
  const items = [
    ["About", "#about"],
    ["Projects", "#projects"],
    ["Experience", "#experience"],
    ["Contact", "#contact"],
  ];

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a href="#top" className="nav-mark magnetic">
        J
      </a>
      <div className="nav-links">
        {items.map(([label, href]) => (
          <a key={label} href={href} className="magnetic">
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="top" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-meta reveal">
        <p>{profile.eyebrow}</p>
        <p>{profile.graduation}</p>
        <div className="meta-rule" />
        {profile.heroMetrics.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      <div className="hero-copy reveal">
        <p className="eyebrow">Portfolio / 2026</p>
        <h1 id="hero-title">{profile.name}</h1>
        <p className="hero-positioning">{profile.positioning}</p>
        <p className="hero-summary">{profile.summary}</p>
        <a href="#projects" className="button primary magnetic">
          <span>View projects</span>
          <span aria-hidden="true" className="button-mark">
            ↗
          </span>
        </a>
      </div>
      <div className="hero-visual shell-card reveal" aria-hidden="true">
        <div className="hero-visual-inner">
          <img src={profile.heroBackdropImage} alt="" />
          <div className="orbital-note">local inference, warm hardware</div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="about section-shell"
      aria-label="About"
    >
      <div className="section-index reveal">01 / About</div>
      <div className="about-copy reveal">
        <p className="eyebrow">Operating notes</p>
        <h2 id="about-title">
          I turn unclear product questions into working systems.
        </h2>
        <p>
          I study Business AI Systems at NUS, with a Management minor, and I
          graduate in December 2027. The useful bit: I can sit with ambiguity,
          test the first principles, then ship something concrete before the
          room gets too comfortable.
        </p>
      </div>
      <div className="about-visual shell-card reveal">
        <div className="about-image">
          <img src="/images/about-warm-abstract.png" alt="Warm abstract placeholder texture" />
        </div>
      </div>
      <div className="principles">
        {aboutPrinciples.map((principle, index) => (
          <article className="principle-card reveal" key={principle.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{principle.title}</h3>
            <p>{principle.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section
      id="projects"
      className="projects"
      aria-label="Projects"
    >
      <div className="projects-intro section-shell">
        <div className="section-index reveal">02 / Projects</div>
        <div className="reveal">
          <p className="eyebrow">Selected systems</p>
          <h2 id="projects-title">Four builds, each with its own object lesson.</h2>
          <p>
            The centrepiece is deliberately visual: each project gets a 3D slot
            now, and a proper model later. Phase 1 uses placeholder geometry,
            because good scaffolding is still scaffolding.
          </p>
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
      className={`project-panel section-shell ${isReverse ? "is-reverse" : ""}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="project-copy reveal">
        <p className="eyebrow">{String(index + 1).padStart(2, "0")} / Project</p>
        <h3 id={`${project.id}-title`}>{project.title}</h3>
        <p className="project-hook">{project.hook}</p>
        <p>{project.impact}</p>
        <ul className="stack-list" aria-label={`${project.title} stack`}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="project-links">
          {project.links.map((link) => (
            <a key={link.label} href={link.href} className="text-link magnetic">
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="project-model shell-card reveal">
        <div className="swap-label">SWAP .glb</div>
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
      <p className="model-caption">{project.modelLabel}</p>
    </div>
  );
}

function Experience() {
  return (
    <section
      id="experience"
      className="experience section-shell"
      aria-label="Experience"
    >
      <div className="section-index reveal">03 / Timeline</div>
      <div className="reveal">
        <p className="eyebrow">Experience</p>
        <h2 id="experience-title">A short record of useful constraints.</h2>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <article className="timeline-item reveal" key={`${item.role}-${item.organisation}`}>
            <span>{item.period}</span>
            <div>
              <h3>{item.role}</h3>
              <p className="timeline-org">{item.organisation}</p>
              <p>{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="contact section-shell"
      aria-label="Contact"
    >
      <div className="contact-meta reveal">
        <p>Availability</p>
        <strong>Select projects / internships</strong>
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
          <a href={`mailto:${contact.email}`} className="button primary magnetic">
            <span>Email Justin</span>
            <span aria-hidden="true" className="button-mark">
              ↗
            </span>
          </a>
          <a href={contact.resumePath} className="button secondary magnetic" download>
            Download resume
          </a>
        </div>
        <div className="social-links">
          <a href={contact.linkedIn}>LinkedIn</a>
          <a href={contact.github}>GitHub</a>
        </div>
      </div>
    </section>
  );
}

export default App;
