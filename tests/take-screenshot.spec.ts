/**
 * Capture a dashboard screenshot for the landing page hero.
 *
 * Prerequisites:
 *   1. Run `supabase start` and `npm run dev`
 *   2. Set env vars: SCREENSHOT_EMAIL and SCREENSHOT_PASSWORD
 *      (credentials of an account that already has a workspace + board)
 *
 * Run with:
 *   SCREENSHOT_EMAIL=you@example.com SCREENSHOT_PASSWORD=yourpass npx playwright test tests/take-screenshot.spec.ts --project=chromium
 *
 * Output: public/screenshot.png
 */

import { test, expect } from "@playwright/test"
import path from "path"

test("capture dashboard screenshot", async ({ page }) => {
  const email = process.env.SCREENSHOT_EMAIL
  const password = process.env.SCREENSHOT_PASSWORD

  if (!email || !password) {
    console.log("Skipping screenshot capture: SCREENSHOT_EMAIL and SCREENSHOT_PASSWORD not set")
    test.skip()
    return
  }

  await page.setViewportSize({ width: 1440, height: 900 })

  // Sign in
  await page.goto("/sign-in")
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole("button", { name: /sign in/i }).click()

  // Wait for redirect to workspace or onboarding
  await page.waitForURL(/\/(w\/|onboarding)/, { timeout: 10000 })

  // If we landed on onboarding, skip (no board to screenshot)
  if (page.url().includes("/onboarding")) {
    console.log("No workspace found — create a workspace and board first")
    return
  }

  // Wait for the kanban board to render
  await page.waitForSelector("[data-testid='kanban-board'], .kanban-column, [class*='kanban']", {
    timeout: 8000,
  }).catch(() => {
    // Board may use different selectors — just wait for network idle
  })

  await page.waitForLoadState("networkidle")

  // Take screenshot
  const screenshotPath = path.join(process.cwd(), "public", "screenshot.png")
  await page.screenshot({ path: screenshotPath, fullPage: false })

  console.log(`Screenshot saved to: ${screenshotPath}`)
})
