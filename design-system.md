# Design System

Reference for CSS variables, utility classes, typography, animation, and content schema. Read this before writing any styles or adding new pages.

---

## Theme System

Theme is stored on `<html data-theme="light|dark">`. Dark is the default (`:root` defines dark values). Light overrides are in `html[data-theme='light']`.

Theme is persisted in `localStorage` under the key `"theme"`. BaseHead applies it before first paint to prevent FOUC. Toggle is in the Header.

---

## CSS Custom Properties

All defined in `src/styles/global.css`.

### Colors (theme-aware — always use these, never hardcode)

| Variable | Dark | Light | Purpose |
|---|---|---|---|
| `--bg-color` | `#151515` | `#faf8f3` | Page background |
| `--text-color` | `#fff` | `#2d2a26` | Body text |
| `--header-bg` | `#151515` | `#faf8f3` | Header/footer background |
| `--header-text` | `#fff` | `#2d2a26` | Header text |
| `--nav-link` | `#fff` | `#2d2a26` | Nav link color |
| `--hamburger-color` | `#fff` | `#2d2a26` | Hamburger icon lines |
| `--hr-color` | `silver` | `#d4cfc4` | Horizontal rule color |
| `--code-bg` | `#2a2a2a` | `#f0ebe1` | Inline code + code block background |
| `--blockquote-bg` | `rgba(255,255,255,0.05)` | `rgba(184,134,11,0.08)` | Blockquote background |
| `--shadow-color` | `0, 0, 0` | `139, 125, 107` | Used in `rgba(var(--shadow-color), %)` |

### Colors (constant — same in both themes unless noted)

| Variable | Value | Purpose |
|---|---|---|
| `--color-theme-1` | `gold` (dark) / `#d97706` (light) | Primary accent — underlines, borders, selection bg |
| `--color-theme-2` | `#FF6F61` (dark) / `#92400e` (light) | Secondary accent — hover states, social icons |

### Other

| Variable | Value | Purpose |
|---|---|---|
| `--box-shadow` | multi-layer gray shadow | General card/element shadow |

---

## Utility Classes

Defined in `global.css` under `=== UTILITY CLASSES ===`.

### `.btn-base`
Standard button/link button style. Gold border, theme-aware background, lifts on hover.

```html
<a href="/somewhere" class="btn-base">Click me</a>
<button class="btn-base">Submit</button>
```

Hover: fills with `--color-theme-1`, lifts `translateY(-2px)`. Active: shrinks `scale(0.97)`.
Light theme hover overrides text to `#110505` for contrast.

### `.flex-center`
`display: flex; align-items: center; justify-content: center;`

### `.card-hover`
Adds lift-and-shadow hover effect to any card element.

```css
transform: translateY(-5px) + box-shadow on hover
```

### `.mb-2` / `.mb-3` / `.mb-4`
Margin-bottom: `1rem` / `1.5rem` / `2rem`

### `.sr-only`
Visually hidden but accessible to screen readers. Use for icon labels.

---

## Typography

| Element | Font | Size |
|---|---|---|
| Body | Inter (Google Fonts) | 24px desktop, 22px mobile |
| Headings (h1–h6), code, buttons | Jost (local woff, also Google Fonts fallback) | Modular scale |

**Modular scale:**
- h1: `3.052em`
- h2: `2.441em`
- h3: `1.953em`
- h4: `1.563em`
- h5: `1.25em`

**Line height:** 1.4 body. 1.2 headings.

**Letter spacing:** `0.5px` body.

**Selection:** `--color-theme-1` background, black text.

---

## Animation

All animations use a consistent easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (springy overshoot).

Standard duration: `0.2s` for micro-interactions, `0.3s` for larger reveals.

Always include:
```css
@media (prefers-reduced-motion: reduce) {
  .your-element { transition: none; animation: none; }
}
```

GPU-safe properties to animate: `transform`, `opacity`. Avoid animating `width`, `height`, `top`, `left`.

---

## Layout

- Max content width: `720px`, centered with `margin: auto`
- Main padding: `3em 1em` desktop, `1em 0.5em` mobile
- Mobile breakpoint: `max-width: 720px`

---

## Blog Post Frontmatter Schema

All posts live in `src/content/blog/` as `.mdx` files.

```yaml
---
title: 'Post Title'          # required — displayed as page title
id: 'url-slug-here'          # required — used as the URL slug
description: 'Short summary' # required — used for SEO and post cards
pubDate: 'Apr 5 2025'        # required — human-readable date string
tags:                        # required — array of lowercase strings
  - tag-one
  - tag-two
---
```

MDX posts can import and use React components:
```mdx
import CustomLink from '../../components/CustomLink';

<CustomLink href="https://example.com">External link</CustomLink>
```

---

## Page Routes

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Home |
| `/blog` | `pages/blog/index.astro` | Blog index |
| `/blog/[slug]` | `pages/blog/[...id].astro` | Individual posts |
| `/til` | `pages/til/index.astro` | TIL index |
| `/til/articles` | `pages/til/articles/index.astro` | |
| `/til/talks` | `pages/til/talks/index.astro` | |
| `/feed` | `pages/feed.astro` | Activity feed |
| `/links` | `pages/links.astro` | Curated links |
| `/bookshelf` | `pages/bookshelf.astro` | Books |
| `/advice` | `pages/advice.astro` | Advice collection |
| `/archive` | `pages/archive.astro` | Content archive |
| `/game` | `pages/game.astro` | Tic-tac-toe |
| `/rss.xml` | auto-generated | RSS feed |
| `/og/[slug].png` | `pages/og/[...id].png.ts` | OG image generation (Satori) |
| `/404` | `pages/404.astro` | |

---

## Data Files

Static data for footer and pages lives in `src/data/`:

- `quotes.js` — array of `{ id, text, author }` objects, shown randomly in footer
- `advice.js` — array of `{ content, source }` objects, shown randomly in footer
