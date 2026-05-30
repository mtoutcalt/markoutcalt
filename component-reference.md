# Component Reference

Quick reference for all components in `src/components/`. Read this before editing or adding components to avoid re-reading every file.

---

## Layout / Shell

### `BaseHead.astro`
Global `<head>` — SEO metadata, OG tags, font loading, theme FOUC prevention.

**Props:** `title: string`, `description: string`, `image?: string` (default `/blog-placeholder-1.jpg`)

**Key behavior:** Contains an `is:inline` script that reads `localStorage.getItem('theme')` and sets `data-theme` on `<html>` before first paint, preventing flash. Also imports `global.css` (the only place it's imported). Every page must include `<BaseHead />`.

---

### `Header.astro`
Sticky top nav with logo, nav links, social icons, mobile hamburger, and theme toggle.

**Props:** none — reads `SITE_TITLE` from `../consts`

**Key behavior:**
- Hamburger menu uses `dataset.menuListenerAttached` flag to prevent duplicate listener attachment across page navigations.
- Theme toggle reads/writes `document.documentElement.dataset.theme` and persists to `localStorage`.
- Header shrinks on scroll via `.shrink` class (handled in `header-animation.css`).
- Mobile breakpoint: `max-width: 720px`.

**Navigation links:** Home, Blog, TIL, Feed, Links, Archive. "Ideas" (`/recurring-ideas`) is commented out.

---

### `Footer.astro`
Site footer with random quote/advice, social links, and copyright.

**Props:** none

**Key behavior:**
- Uses `transition:persist="footer"` to stay mounted across View Transitions page navigations.
- On load, randomly shows either a quote (from `src/data/quotes.js`) or a piece of advice (from `src/data/advice.js`). Refresh button cycles to another random item.
- Scroll-triggered reveal animation via `IntersectionObserver` (`.footer-animate` / `.footer-in-view` classes). Respects `prefers-reduced-motion`.
- Listens for `astro:after-swap` to re-initialize quote and animation after page navigation.

---

## Navigation

### `HeaderLink.astro`
Nav link with active-state underline animation.

**Props:** `href: string`, plus any `HTMLAttributes<'a'>`

**Key behavior:** Compares `href` to current `pathname` (and first path segment) to set `.active` class. Active and hovered links get an animated `::after` underline that scales in from center using `var(--color-theme-2)`.

---

## Utilities

### `FormattedDate.astro`
Renders a `Date` object as a human-readable string.

**Props:** `date: Date`

Use this whenever displaying post dates for consistent formatting.

---

### `CustomLink.jsx`
Smart link: automatically adds `target="_blank" rel="noopener noreferrer"` for external URLs.

**Props:** `href: string`, `children`

**Key behavior:** Detects external links by checking `href.startsWith('http')`. Use inside MDX content files instead of raw `<a>` tags for external links.

---

### `SquigglyHR.astro`
Decorative SVG squiggly horizontal rule.

**Props:** none

Use instead of `<hr>` for stylized section breaks in content.

---

### `progressBar.astro`
Scroll-driven reading progress bar.

**Props:** none (self-contained)

Typically placed in blog post layouts to show reading progress.

---

## Interactive (React Islands)

### `tictactoe.jsx`
Fully interactive Tic-tac-toe game with move history and replay.

**Props:** none (self-contained React component)

**Key behavior:** Uses React state for board, current move, and history. Rendered on `/game` page as an Astro island. Game board styles (`.square`, `.board-row`, `.game`, `.game-info`, `.status`) live in `global.css` — not scoped to the component.

---

## Adding a New Component

1. For purely static/templating work: use `.astro`
2. For interactive elements needing React state: use `.jsx` (Astro island)
3. Always check `global.css` for existing utility classes before writing new styles
4. New components must be theme-compatible — use CSS variables, never hardcode colors
5. Add `@media (prefers-reduced-motion: reduce)` for any animations
