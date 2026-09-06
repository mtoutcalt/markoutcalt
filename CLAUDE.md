# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start for New Sessions
Before starting any work, read these files in order:

1. **pair_programming_workflow.md** - Our workflow process for task management and collaboration
2. **technical_considerations.md** - Technical decisions, lessons learned, and implementation notes
3. **component-reference.md** - All components: purpose, props, key behaviors
4. **design-system.md** - CSS variables, utility classes, typography, animation, blog schema, routes
5. **README.md** - Project overview, tech stack, and development commands
6. **package.json** - Available scripts and dependencies
7. **astro.config.mjs** - Astro configuration and build settings

Key workflow reminders:

- Always use the TodoWrite tool to track task progress
- Test changes with `npm run dev` and verify with `npm run preview` 
- Remember that Astro behaves differently in production - always test with preview
- Use WSL on Windows for optimal development experience

## Overview
Mark Outcalt's personal website and blog built with Astro, featuring chronologically organized blog posts, notes, curated links, and interactive elements. The site showcases a modern, responsive design with dark theme support and content syndication through RSS.

## Development Commands

### Core Development
- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Serve the real `.vercel/output` build locally via `scripts/preview.mjs` (`astro preview` does not support the Vercel adapter)  
- `npm run newp` - Build then preview (useful for production verification)

### Testing
- `npm run test` - Run Playwright tests
- `npm run test:ui` - Run Playwright tests with UI
- `npm run test:debug` - Debug Playwright tests

### Package Management
- Uses npm as the package manager
- Lock file: package-lock.json

## Architecture Overview

### Technology Stack
- **Frontend**: Astro 7.x with React components for interactivity
- **Content**: MDX for enhanced markdown with React components
- **Styling**: Custom CSS with dark theme support
- **Testing**: Playwright for end-to-end testing
- **Deployment**: On-demand rendering on Vercel (`output: 'server'` + `@astrojs/vercel`)

### Rendering model
The site is fully prerendered (`output: 'static'`) and served from Vercel's
CDN. Every route becomes a file at build time; there are no serverless
functions in `.vercel/output`.

It briefly rendered on demand so `src/middleware.ts` could content-negotiate
Markdown per request. That was reverted: negotiation forced
`Cache-Control: max-age=0, must-revalidate` and `Vary: Accept` onto every
response, which stopped browsers reusing the HTML that `prefetch: true` had
already fetched — real visitors paid a round trip on every click so agents
could have Markdown at the same URL. Agents now read the prerendered `.md`
twins instead, and nothing is negotiated.

- `@astrojs/sitemap` discovers posts from the build output again, so the
  `customPages` / `blogPostUrls()` workaround in `astro.config.mjs` is gone.
- `npm run preview` still serves `.vercel/output` via `scripts/preview.mjs`.
  With no functions to load it is now just a static file server, but it stays
  the honest check because it serves the exact artifact Vercel receives.

### No client-side router
There is deliberately no `<ClientRouter />` anywhere. It used to be on the
homepage, archive, feed, bookshelf, game and 404 but *not* on `BlogPost.astro`
(removed in `3c38a58`). That asymmetry made every click from a listing page to
a post fetch the post twice: the router fetched it, found no
`astro-view-transitions-enabled` meta, discarded it and handed off to a normal
browser navigation. The first fetch was a background `fetch()`, so the browser
showed no loading indicator at all — the page just sat there.

If you reintroduce it, it has to go on **every** page including `BlogPost.astro`,
and these come back with it:

- `Footer.astro` needs its `astro:after-swap` re-init and `transition:persist`.
- `feed.astro` needs `astro:page-load` again (it also listens on
  `DOMContentLoaded`, which is what carries it today).
- `Header.astro` initialises on `DOMContentLoaded`; it would need the swap event.

### Build steps
`npm run build` is `astro build && node scripts/cache-headers.mjs`. The second
step patches `.vercel/output/config.json` to put
`cache-control: public, max-age=60, stale-while-revalidate=86400` on HTML pages.
It cannot be done in `vercel.json` — Vercel ignores that file's routing config
for Build Output API projects, which is what `@astrojs/vercel` produces. Without
it, Vercel's static-HTML default (`max-age=0, must-revalidate`) forbids the
browser reusing what `prefetch: true` already fetched.

### Agent readiness
Machine-facing behaviour is covered by `tests/agent-readiness.spec.js`. Run it
before changing anything below:

- **Markdown twins** (`src/integrations/markdown-twins.ts`,
  `src/lib/html-to-markdown.ts`): every post is also written to
  `/blog/<id>.md` at build time. The integration runs on `astro:build:done`
  and converts the **built HTML**, not the MDX source — `quotes`, `advice` and
  `programmer-quotes` have bodies that are a single JSX map over a file in
  `src/data/`, so their source carries no prose at all. It must stay last in
  `integrations` so it reads HTML the rest of the build has finished writing.
- Mark decorative markup inside a post page with `data-md-omit` to keep it out
  of the twin (`.author-avatar` is the current example). `.sr-only` is dropped
  too. Only the `<main>` region is converted at all.
- Rendering a post from inside a `.md` endpoint does **not** work: it needs the
  container API, and `loadRenderers` does a runtime `import()` the prerender
  bundle cannot resolve. Use the build hook.
- **Structured data** lives in `src/lib/structured-data.ts`. Every page emits the
  same `Person` / `WebSite` `@id` nodes. Absolute URLs must use the apex domain
  (`https://markoutcalt.com`) — a `www.` URL splits the brand signal and a test
  fails on it.
- **`/llms.txt`** (`src/pages/llms.txt.ts`) indexes the site for agents and
  links each post's `.md` twin; the 404 page points at it.

### Content Management System
The site uses Astro's content collections for structured content:

- `src/content/blog/` - Full blog posts with frontmatter
- `draftblogs/` - Working drafts organized by category (finance, tech, personal, etc.)
- `src/data/` - JavaScript data files for quotes and advice
- `public/` - Static assets (images, fonts, favicon)

## Project Structure Overview

```
/
├── public/            # Static assets (images, fonts, favicon)
├── src/
│   ├── components/    # Astro/React UI components
│   ├── content/       # Content collections (blog posts)
│   ├── data/          # JavaScript data files  
│   ├── layouts/       # Page layout templates
│   ├── pages/         # Page components and routes
│   └── styles/        # Global CSS styles
├── draftblogs/        # Draft content organized by category
├── tests/             # Playwright test files
└── dist/              # Production build output
```

## Development Notes

### Important Considerations
- **WSL File Watching**: The project is configured with `usePolling: true` in vite config to fix file watching issues in WSL
- **node_modules is platform-specific — DO NOT run `npm install`/`npm run build` on Windows**: This project lives in a OneDrive folder that is shared between Windows and WSL, but `node_modules` contains **native binaries that differ per OS** (Rolldown/Vite bundler, the Rust `.astro` compiler, Sätteri markdown, sharp, etc.). Since we build in **WSL**, always run `npm install` and builds **inside WSL** so the Linux bindings get installed. Running `npm install` from Windows PowerShell installs the `win32-x64-msvc` binaries and leaves WSL builds failing with errors like `Cannot find module '@rolldown/binding-linux-x64-gnu'`. If you see a "Cannot find native binding" error, the fix is: in WSL, `rm -rf node_modules package-lock.json && npm install`. (The old `optionalDependencies` pin on `@rollup/rollup-*` is obsolete as of Vite 8/Rolldown.)
- **Node version**: The project targets **Node 24** (see `.nvmrc` and `engines` in package.json; Vercel reads `engines.node`). Astro 7 / Vite 8 require ≥ 22.12, but build on 24 to match production. The WSL default `node` may be older (v18); run `nvm use 24` before any npm command in WSL. Note that Node 24 pools file reads into a shared 64KB slab, so never pass `buffer.buffer` to a library — pass the Buffer itself, or slice with `byteOffset`/`byteLength`.
- **Production Differences**: Astro can behave differently in production, always verify with `npm run preview`
- **Theme System**: Uses custom dark theme implementation (not Tailwind-based)
- **Interactive Components**: React components are used for interactive elements like games

### Content Guidelines
- Blog posts go in `src/content/blog/` with proper frontmatter
- Draft content can be organized in `draftblogs/` by category
- Data-driven content (quotes, advice) uses JavaScript files in `src/data/`
- Images should be optimized and placed in `public/` directory

### Animation Best Practices
When adding CSS animations or transitions to components:

**Performance Optimization:**
- Use `will-change` property sparingly and only on actively animating elements
- Prefer `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating layout properties like `width`, `height`, `top`, `left`
- Set `transform-origin` explicitly when using transforms
- Remove `will-change` after animations complete when possible

**Accessibility:**
- Always include `@media (prefers-reduced-motion: reduce)` query
- Disable or significantly reduce animations for users with motion sensitivity
- Provide instant state changes instead of transitions when motion is reduced

**Example Pattern:**
```css
.animated-element {
  transform: translateY(0);
  transform-origin: center bottom;
  transition: transform 0.3s ease;
  /* Only use will-change during active animations */
}

.animated-element.animating {
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: none;
  }
}
```

**Reference:** See [theme-toggle.css](src/styles/theme-toggle.css) and [header-animation.css](src/styles/header-animation.css) for implementation examples.

### Testing Strategy
- Playwright tests cover homepage and blog functionality
- Tests are located in `tests/` directory
- Run tests before deploying changes

## Common Tasks

### Adding New Blog Posts
1. Create new .mdx file in `src/content/blog/`
2. Include proper frontmatter (title, date, description, tags)
3. Test with `npm run dev` then verify with `npm run preview`

### Modifying Components
1. Edit components in `src/components/`
2. Test interactive components thoroughly
3. Verify theme compatibility in both light and dark modes

### Deployment Preparation
1. Run `npm run build` to generate production build
2. Test with `npm run preview` to verify production behavior
3. Run `npm run test` to ensure all tests pass
4. Check `dist/` output for any issues

## Analytics
The site uses Tiny Analytics for traffic monitoring:
- Dashboard: https://tinylytics.app/sites/2509
- Main site: https://tinylytics.app/

## Theme Credit
Based on the [Bear Blog](https://github.com/HermanMartinus/bearblog/) template, customized and extended with additional features for personal branding and content management.