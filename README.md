# Mark Outcalt - Personal Website & Blog

A modern, responsive personal website and blog built with Astro, showcasing my work, thoughts, and interests.

## 🌟 Features

- **Blog Section**: Chronologically organized posts with tag support
- **Notes**: Less formal content and quick thoughts
- **Curated Links**: Collection of favorite websites and resources
- **Content Archive**: Browse all content with tag filtering
- **Interactive Elements**: Including games built with React
- **Mastodon Feed**: Social media integration
- **Responsive Design**: Mobile-friendly layout with custom styling
- **Dark Theme**: Elegant dark-mode design
- **Accessibility**: WCAG 2.1 AA compliant with automated testing

## 🛠️ Tech Stack

- [Astro](https://astro.build) - Core framework
- [React](https://reactjs.org) - Interactive components
- [MDX](https://mdxjs.com) - Enhanced markdown for content
- [Playwright](https://playwright.dev) - End-to-end testing
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- TypeScript - Type safety
- RSS Feed - Content syndication
- Content Collections - Structured content management

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run newp`            | Rebuild then start preview/prod server           |
| `npm run test`            | Run all Playwright tests                         |
| `npm run test:ui`         | Run tests with Playwright UI                     |
| `npm run test:debug`      | Debug Playwright tests                           |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |


#### NOTE!
* Sometimes Astro will behave different in 'prod' - so run `npm run preview` for more verification.  But also note that after every change you need to run `npm run build` first!
* For windows -- run with wsl (linux subsystem)
* astro components will current need a  <ClientRouter /> configured to get theme toggle to work

#### WSL File Watching Fix
If you're using WSL (Windows Subsystem for Linux) and experiencing issues with hot reloading not working when you make file changes, you may need to enable polling-based file watching. This is already configured in `astro.config.mjs`:

```js
vite: {
  server: {
    watch: {
      usePolling: true, // Fixes file watching issues in WSL
    }
  }
}

## 📂 Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── content/       # Content collections (blog, notes)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Page components
│   └── styles/        # Global styles
└── draftblogs/        # Draft content
```

## 📝 Content Management

Content is organized using Astro's content collections:
- `src/content/blog/` - Full blog posts
- `src/content/notes/` - Shorter notes and thoughts
- `draftblogs/` - Working drafts organized by category

## 🔍 Testing

### Accessibility Testing
This project includes automated accessibility testing using axe-core to ensure WCAG 2.1 AA compliance.

```bash
# Run all accessibility tests
npm run test tests/accessibility.spec.js

# Test specific accessibility features
npm run test tests/accessibility.spec.js -- --grep "homepage"
npm run test tests/accessibility.spec.js -- --grep "mobile menu"

# View detailed test report
npx playwright show-report
```

### Available Test Suites
- **Homepage accessibility** - Checks main page for WCAG violations
- **Blog page accessibility** - Validates blog post layouts
- **Mobile navigation** - Tests hamburger menu accessibility
- **Keyboard navigation** - Ensures full keyboard support
- **Focus management** - Validates focus indicators and tab order
- **Color contrast** - Verifies WCAG color contrast standards

### Manual Testing Tools
For additional accessibility validation, consider these browser extensions:
- **axe DevTools** (Chrome/Firefox) - Industry standard accessibility scanner
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Built into Chrome DevTools

## Tiny Analytics
* https://tinylytics.app/
* https://tinylytics.app/sites/2509

## 🙏 Credit

This theme is based on the [Bear Blog](https://github.com/HermanMartinus/bearblog/) template, customized and extended with additional features.

```sh
# Site was initially created with:
npm create astro@latest -- --template blog
```



### TODO
* accessibility test for light and dark mode?
* CSS modernization?
  * CSS Layers?
* improve 404 page and other pages like that?
* ideas to use fun stuff like this animated animal following user - https://github.com/Prasanna-icefire/Animated_login_page_bear
* header links - 'home' doesnt have a hover state