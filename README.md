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

## 🛠️ Tech Stack

- [Astro](https://astro.build) - Core framework
- [React](https://reactjs.org) - Interactive components
- [MDX](https://mdxjs.com) - Enhanced markdown for content
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
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |


#### NOTE!
* Sometimes Astro will behave different in 'prod' - so run `npm run preview` for more verification.  But also note that after every change you need to run `npm run build` first!


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

## 🙏 Credit

This theme is based on the [Bear Blog](https://github.com/HermanMartinus/bearblog/) template, customized and extended with additional features.

```sh
# Site was initially created with:
npm create astro@latest -- --template blog
```