/**
 * Landing page design consistency & quality checks.
 *
 * Prerequisites: npm run dev (dev server on localhost:3000)
 *
 * Run with: npx playwright test tests/landing.spec.ts --project=chromium
 */

import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Landing page is public — should not redirect to sign-in
    await expect(page).not.toHaveURL(/sign-in/)
  })

  test("renders navigation", async ({ page }) => {
    const nav = page.locator("header").first()
    await expect(nav).toBeVisible()
    await expect(nav.getByText("Orbit")).toBeVisible()
    await expect(nav.getByRole("link", { name: /sign in/i })).toBeVisible()
    await expect(nav.getByRole("link", { name: /get started/i })).toBeVisible()
  })

  test("renders hero section", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    // "Get started free" appears in hero + pricing section; scope to the first occurrence
    await expect(page.getByRole("link", { name: /get started free/i }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: /view pricing/i })).toBeVisible()
  })

  test("renders features section", async ({ page }) => {
    await expect(page.getByText(/built for how teams actually work/i)).toBeVisible()
    await expect(page.getByText("Kanban boards")).toBeVisible()
    await expect(page.getByText("Team collaboration")).toBeVisible()
    await expect(page.getByText(/AI-powered/i)).toBeVisible()
  })

  test("renders pricing section", async ({ page }) => {
    await expect(page.getByText("Simple, transparent pricing")).toBeVisible()
    // Use heading role to avoid matching "Free" inside button/paragraph text
    await expect(page.getByRole("heading", { name: "Free" }).first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Lite" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible()
    await expect(page.getByText("Most popular")).toBeVisible()
    await expect(page.getByRole("link", { name: /see full pricing/i })).toBeVisible()
  })

  test("renders footer", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible()
  })

  test("pricing link navigates correctly", async ({ page }) => {
    await page.getByRole("link", { name: /see full pricing/i }).click()
    await expect(page).toHaveURL("/pricing")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/pricing/i)
  })

  test("get started links to sign-up", async ({ page }) => {
    // First occurrence is the hero CTA
    const href = await page.getByRole("link", { name: /get started free/i }).first().getAttribute("href")
    expect(href).toMatch(/sign-up/)
  })

  test("page has dark background", async ({ page }) => {
    const bg = await page.evaluate(() => {
      const el = document.querySelector("body") as HTMLElement
      return window.getComputedStyle(el).backgroundColor
    })
    // Dark background should have low RGB values
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      const brightness = (r + g + b) / 3
      expect(brightness).toBeLessThan(50)
    }
  })

  test("full page screenshot for visual review", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("landing-full.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe("Pricing page", () => {
  test("renders standalone pricing page", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/pricing/i)
    await expect(page.getByText("Most popular")).toBeVisible()
    await expect(page.getByText("$9")).toBeVisible()
    await expect(page.getByText("$19")).toBeVisible()
  })

  test("pricing page has dark background", async ({ page }) => {
    await page.goto("/pricing")
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    const match = bodyBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      expect((r + g + b) / 3).toBeLessThan(50)
    }
  })

  test("full page screenshot for visual review", async ({ page }) => {
    await page.goto("/pricing")
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("pricing-full.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})
