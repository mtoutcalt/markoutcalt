import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4322',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // Tested against the real build, not `astro dev`. The Markdown twins and the
  // sitemap are both build artifacts that the dev server never produces, and
  // these are HTTP-contract tests — they have to see what Vercel will serve.
  // Port 4322 so a dev server on 4321 can keep running; `reuseExistingServer`
  // is off so a stale server is never silently tested instead of this build.
  webServer: {
    command: 'npm run build && PORT=4322 npm run preview',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});