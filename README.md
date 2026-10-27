# Justin Portfolio

Single-page scrollytelling portfolio for Justin Goh, live at [justingohzk.com](https://justingohzk.com). Built with Vite, React 19, Tailwind, Motion, Lenis, and react-three-fiber, styled with the warm **Earth & Intellect** palette originally generated in Stitch.

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm test         # vitest
npm run build    # type-check + production build into dist/
```

## Page structure

Intro keycap gate → Hero (incoming role) → 01 Experience → 02 Projects → 03 About → 04 Toolkit → 05 Contact.

- The intro can be entered by clicking the keycap, scrolling, swiping up, pressing Enter/Esc, or "Skip intro". It shows once per browser session; the **J** nav mark replays it.
- The nav, scroll wheel, and dock live outside `.portfolio-shell` on purpose: the shell animates `transform`/`filter` during the intro, which would otherwise break `position: fixed`.

## Editing content

Everything content-related lives in `src/data/portfolio.ts`:

| Export | Drives |
| --- | --- |
| `profile` | Hero name, degree, positioning, "Previously" roles, portrait |
| `experience` | Timeline. Set `status: "Incoming"` on an upcoming role and it also becomes the hero status pill |
| `projects` | Project panels, links, 3D model and static render |
| `aboutSlides` | About slideshow photos and captions |
| `credentials`, `skillGroups` | Toolkit section |
| `contact` | Email, socials, resume, availability, location |

`src/data/portfolio.test.ts` checks that every referenced image or model exists in `public/`.

## Assets

- **Images** are served as right-sized WebP from `public/images/` (originals are kept locally in the git-ignored `assets/`). Aim for about 2x the displayed size: ~1100px for photos, 256px for experience logos, 96px for skill logos.
- **Models** are compressed `.glb` files in `public/models/` (KTX2 textures + meshopt; the Basis transcoder is in `public/basis/`).
- **Model renders** (`public/images/*-render.webp`) are transparent stills of each model. They show while the GLB loads and for visitors who prefer reduced motion, then crossfade into the live canvas. If you replace a model, capture a new render at the same framing.
- **Social card**: `public/images/og-card.jpg` (1200x630), referenced from `index.html`.
