# Daniel Tureck Website Rebuild — Phased Plan

## Context

Daniel Tureck is a mix engineer (R&B, Hip-Hop, Soul, Pop) operating out of Robot Slap Studios. His existing site is a clean but basic 11ty static site with Decap CMS — warm cream palette, Inter font, minimal sections, zero interactivity. The goal is to evolve it into a bold, modern, intentionally-designed single-page portfolio that reflects his brand: **"Timeless by design."** The site should feel premium, grounded, and human — not flashy, not cluttered. Clean and bold with movement.

**Key decisions made:**
- Phased approach (3 phases, review between each)
- Warm/light color palette (keep cream foundation)
- Clash Display heading font + Caveat hand-drawn accents + Inter body
- Custom HTML audio player with before/after toggle (WAV→MP3)
- No file upload — clients paste links
- Contact forms via Formspree (static-site friendly)

---

## Phase 1: Design Foundation + Layout

Typography, color, logo, section structure, copy, CMS config. Site looks right but has no interactivity beyond links.

### 1.1 Typography Setup

- **Headings:** Clash Display (self-hosted woff2 from Fontshare) — `--font-heading`
- **Body:** Inter (Google Fonts, weights 400-600) — `--font-body`
- **Accent:** Caveat (Google Fonts, weight 400) — `--font-accent`

**Files:**
- `src/_includes/base.njk` — Replace Google Fonts link (remove Inter 700-900, add Caveat), add `<link rel="preload">` for Clash Display woff2
- `src/css/style.css` — Add `@font-face` for Clash Display, new CSS custom properties
- **New:** `src/assets/fonts/ClashDisplay-Variable.woff2` — Download from Fontshare

### 1.2 Color Palette (warm/light, evolved)

```
--cream:       #F5F0E8   (primary background)
--linen:       #EBE5DB   (section alternates)
--sand:        #DED6C8   (borders, subtle accents)
--charcoal:    #1A1A1A   (primary text, dark sections)
--warm-gray:   #4A4641   (body text)
--soft-gray:   #7D766D   (secondary text, labels)
--orange:      #E85D04   (accent, CTAs)
--white:       #FFFFFF   (text on dark sections)
```

Studio and footer sections stay dark (`--charcoal` bg) for contrast/rhythm.

### 1.3 Robot Slap Logo

- Copy `_content/robot slap logo.svg` → `src/assets/images/robot-slap-logo.svg`
- Modify SVG `fill` to `currentColor` for color flexibility
- Inline in hero section
- Use as favicon: `<link rel="icon" type="image/svg+xml" href="/assets/images/robot-slap-logo.svg">`

### 1.4 Section Structure (new page flow)

Rewrite `src/index.njk`:

1. **Hero** — Robot Slap logo (inline SVG) + "Daniel Tureck" (Clash Display, massive) + "Mix Engineer" + hero phrase: *"Your vision, brought to life — timeless by design."*
2. **Identity Photo + Phrase** — Full-width hero photo + *"Pocket. Groove. Emotional weight."* (Clash Display) + *"timeless by design"* in Caveat accent
3. **Narrative** — Two-column: heading *"Some music has a pulse you cannot fake."* + 2 bio paragraphs + tagline *"You made it. I finish it. It lives forever."*
4. **Photo Grid** — 2-column grid with hover effects (placeholder CSS for Phase 2 animation)
5. **Work / Listen** — Section label + artist names + placeholder for audio player (Phase 2) + Muso credits link
6. **Studio** — Dark bg section. "Robot Slap Studios" + description + photo. "Mixed at Robotslap Studios" identity line.
7. **Wide Photo** — Cinematic full-width break
8. **Podcasts & Brands** — Placeholder section (populated Phase 3)
9. **Contact / CTA** — Heading + Instagram + Email buttons (forms added Phase 3)
10. **Footer** — Small Robot Slap logo + copyright + location

### 1.5 Copy Updates

Update data files with refined copy from the brief:

- `src/_data/bio.json` — Add `hero_sentence`, `tagline` fields
- `src/_data/narrative.json` — Refine paragraphs (grounded, warm, short)
- `src/_data/studio.json` — Add "Mixed at Robotslap Studios" identity
- `src/_data/site.json` — Update meta description
- `src/_data/tracks.json` — Expand artist list to full roster (18 artists)

### 1.6 CSS Rewrite

Full rewrite of `src/css/style.css` (~600-800 lines):
- New custom properties (fonts, colors, spacing)
- Clash Display heading scale using `clamp()` for fluid type
- `.reveal` class system (opacity: 0 by default, animated to 1 via JS in Phase 2)
- Responsive breakpoints: 1024px, 768px, 480px
- Section-specific backgrounds (cream default, charcoal for studio/footer, orange for CTA accents)
- Photo hover prep (CSS transitions)
- Player placeholder styling

### 1.7 CMS Config

Update `src/admin/config.yml`:
- Add `hero_sentence` and `tagline` fields to bio
- Add stub entries for new data files (audio, brands, faq) so they're ready for Phase 2/3

### 1.8 Eleventy Config

Update `.eleventy.js`:
- Add `src/assets/fonts` to passthrough copy

### Phase 1 Verification
- `npm start` — all sections render correctly
- Fonts load (check Network tab for Clash Display, Caveat, Inter)
- Favicon appears in browser tab
- Responsive at 1024, 768, 480px
- Decap CMS loads at `/admin/` with all fields
- Lighthouse: 90+ performance, 100 SEO

---

## Phase 2: Interactions + Audio Player

Scroll animations, hover effects, fixed nav, custom before/after audio player.

### 2.1 Animation System (no external libs)

`src/js/main.js` — Build from scratch (~80 lines):

- **Scroll reveal:** Intersection Observer watches `.reveal` elements, adds `.revealed` class on enter. Supports `--delay` custom property for stagger. One-shot (unobserves after reveal).
- **Parallax:** Single scroll listener with rAF, updates `--scroll-y` CSS var on `[data-parallax]` elements.
- **Fixed nav:** Observer on `.hero` — toggles `.nav--visible` when hero leaves viewport.

`src/css/style.css` — Add animation classes:
```css
.reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal.revealed { opacity: 1; transform: translate(0); }
```

### 2.2 Photo Hover Effects (CSS only)

```css
.photo-grid__item img { transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1); }
.photo-grid__item:hover img { transform: scale(1.03); }
```

### 2.3 Audio Preparation (manual prerequisite)

- Convert WAV → MP3 320kbps via `ffmpeg`
- Host on Cloudflare R2 (free tier) or GitHub Releases
- Populate `src/_data/audio.json` with URLs

**Before/after pairs (7):** Bestie, Cameo Adele, Daniel Kristoff, James Vickery, My Cousin's House (x2), Sterling Victorian

**Showcase tracks (~10-12):** Select from the 26 other songs, prioritizing the listed artist pool

### 2.4 Custom Audio Player

`src/js/main.js` — Add audio engine (~120 lines). Reference patterns from old site at `archive/old-site/js/main.js`:

- **AudioEngine singleton:** One `<audio>` element, manages play/pause/seek globally (only one track at a time)
- **A/B Player:** Before/after toggle per track. Syncs `currentTime` when switching sources for seamless comparison.
- **Tracklist Player:** Simple play/pause for showcase tracks
- **Loading states:** Spinner while MP3 buffers
- **Mobile:** Touch-friendly progress bar seeking
- **Keyboard:** Space = play/pause, arrow keys = seek

`src/index.njk` — Replace Listen placeholder with data-driven template:
- `{% for track in audio.before_after %}` → A/B player markup
- `{% for track in audio.showcase %}` → Tracklist markup

`src/css/style.css` — Player styles (progress bar, toggles, track list, active states)

### 2.5 Fixed Navigation

`src/index.njk` — Add `<nav>` with Robot Slap logo + Work / Studio / Contact links
`src/css/style.css` — Fixed position, backdrop-filter blur, hidden by default, slides in via `.nav--visible`

### Phase 2 Verification
- Audio: play, pause, seek, before/after toggle, seamless A/B switch
- Only one track plays at a time
- Scroll animations fire once, stagger works
- Nav appears/hides on scroll
- Photo hovers work
- Mobile: touch seek, responsive player
- Safari, Chrome, Firefox

---

## Phase 3: Brands, FAQ, Contact Forms

### 3.1 Podcasts & Brands Section

**New:** `src/_data/brands.json` — Full list (12+ podcast/brand entries + commercials)

`src/index.njk` — Responsive grid section with brand name + project name per item. Staggered reveal animations.

`src/css/style.css` — 2-column grid (auto-fill, minmax(280px, 1fr)), border separators, hover highlight.

### 3.2 FAQ Accordion

**New:** `src/_data/faq.json` — 5-6 questions (genres, remote mixing, getting started, turnaround, pricing)

`src/index.njk` — Native `<details>`/`<summary>` elements (accessible, no-JS-required). Chevron icon rotates on open.

`src/js/main.js` — Optional smooth height animation (~20 lines)

`src/css/style.css` — Accordion styles with border separators, heading font for questions

### 3.3 Dual Contact Forms

`src/index.njk` — Two side-by-side forms:

**"Request a Mix":** Name, Email, Artist Name, Project Title, # of Songs, Timeline (dropdown), Link to Files (URL input), Notes (textarea)

**"General Inquiry":** Name, Email, Message

Both submit to Formspree endpoints (free tier: 50 submissions/month). Standard HTML `action` + `method="POST"`.

`src/js/main.js` — Form enhancement (~30 lines): fetch-based submit, loading state on button, "Sent!" confirmation, error handling.

`src/css/style.css` — Dark input fields on cream bg, orange submit buttons, responsive stacking on mobile.

### 3.4 CMS Config Finalization

`src/admin/config.yml` — Full collection entries for brands, faq, audio with all widget types.

### 3.5 Final Polish
- Add additional photos from `_content/photo selects/` (optimize to 1920px, ~300-500KB)
- `loading="lazy"` on all images below the fold
- `width`/`height` attributes on all images
- Preload Clash Display font file
- Cross-browser test: Chrome, Safari, Firefox, Edge
- Mobile test: iOS Safari, Android Chrome
- Responsive: 1440, 1280, 1024, 768, 414, 375px

### Phase 3 Verification
- Forms submit to Formspree successfully
- Validation prevents empty required fields
- "Sent!" confirmation appears
- FAQ opens/closes with animation
- Brands grid displays all items
- Full scroll-through is smooth
- Lighthouse: 90+ all categories
- Decap CMS: all sections editable

---

## Critical Files Summary

| File | Phases | What Changes |
|------|--------|-------------|
| `src/index.njk` | 1, 2, 3 | Full section restructure → player → forms/FAQ |
| `src/css/style.css` | 1, 2, 3 | Full rewrite: typography, layout, player, forms |
| `src/js/main.js` | 2, 3 | Animations, audio player, form handling |
| `src/_includes/base.njk` | 1 | Fonts, favicon, meta, script tag |
| `src/admin/config.yml` | 1, 3 | New data file collections |
| `.eleventy.js` | 1 | Fonts passthrough |
| `src/_data/bio.json` | 1 | Add hero_sentence, tagline |
| `src/_data/narrative.json` | 1 | Refined copy |
| `src/_data/studio.json` | 1 | Add "Mixed at Robotslap" line |
| `src/_data/tracks.json` | 1 | Expanded artist list |
| `src/_data/site.json` | 1 | Updated meta |

**New files:** `src/assets/fonts/ClashDisplay-Variable.woff2`, `src/assets/images/robot-slap-logo.svg`, `src/_data/audio.json`, `src/_data/brands.json`, `src/_data/faq.json`

**Reference:** `archive/old-site/js/main.js` — Reuse audio player patterns and Intersection Observer logic

---

## Starting Point

We begin with **Phase 1**. Once complete, you review the visual foundation before we add interactivity.
