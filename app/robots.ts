import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://orbit.app"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/sign-in", "/sign-up"],
        disallow: ["/w/", "/settings/", "/onboarding/", "/api/", "/invite/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
