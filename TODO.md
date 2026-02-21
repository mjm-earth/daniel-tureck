# Daniel Tureck — Launch Checklist

---

## REMAINING — Needs your input

### 1. Formspree Endpoints (forms don't submit yet)
Both contact forms point to placeholder URLs and will silently fail.

- **File:** `src/index.njk` lines 212 and 262
- **Current:** `action="https://formspree.io/f/placeholder"`
- **Fix:** Create two forms at [formspree.io](https://formspree.io) (free tier = 50 submissions/month), paste the real form IDs
  - One for "Request a Mix"
  - One for "General Inquiry"
- **Alternative:** Skip Formspree, just use `mailto:daniel@robotslap.com` links instead

### 2. Domain / Deployment Config
Currently configured for GitHub Pages at `mjm-earth.github.io/daniel-tureck/`:
- `.eleventy.js` → `pathPrefix: "/daniel-tureck/"`
- `src/_data/site.json` → `url: "https://mjm-earth.github.io/daniel-tureck"`

If launching on a **custom domain** (e.g. `danieltureck.com`):
- Change `pathPrefix` to `"/"`
- Update `site.json` URL
- Add a `CNAME` file to `src/` with the domain
- Configure DNS (A record or CNAME to GitHub Pages)

If staying on **GitHub Pages subfolder** — no changes needed.

---

## DONE

- [x] OG / Twitter / structured data image URLs fixed (`| url` filter added)
- [x] PNG favicon fallback added (32x32)
- [x] CMS admin config rewritten to match all actual data file shapes
- [x] Sitemap.xml added
- [x] robots.txt added
- [x] Image width/height attributes verified (studio cards fixed)
- [x] Removed unused `.reveal` classes from HTML
- [x] Typography (Inter + Caveat loaded, custom properties set)
- [x] Color palette (cream/linen/sand/charcoal/olive-green)
- [x] Robot Slap SVG logo with magnetic hover + click-to-scatter effect
- [x] Section layout: Hero → Photo → About → Photo → Mixes → Photo → Studio → Photo → Contact → Footer Photo → Footer
- [x] Fixed nav with scroll-triggered visibility + active state highlighting
- [x] Mobile bottom nav (iOS-style pill bar with icons)
- [x] Custom A/B before/after audio player (7 tracks, time-synced toggle)
- [x] Showcase tracklist player (26 tracks)
- [x] Subgenre filter tabs (All / R&B / Hip-Hop / Live) with featured reordering
- [x] Show More/Less truncation on track lists
- [x] Parallax scroll on section photos + footer photo
- [x] Keyboard controls (Space = play/pause, arrows = seek)
- [x] Contact form UI (tabbed: Request a Mix / General Inquiry) with all fields
- [x] Form submit JS (fetch-based with loading/success/error states)
- [x] Podcasts & Brands page (`/podcasts/`) with services grid + client list
- [x] Decap CMS at `/admin/` with collections for all data files
- [x] Structured data (JSON-LD Person schema)
- [x] Open Graph + Twitter Card meta tags
- [x] Responsive design (1024, 768, 480 breakpoints)
- [x] All audio files present locally (MP3)
- [x] All photos present locally
- [x] GitHub repo + GitHub Pages deployment pipeline
