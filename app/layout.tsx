import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://orbit.app"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Orbit — Project management for modern teams",
    template: "%s — Orbit",
  },
  description:
    "Orbit is the project management tool your team actually wants to use. Kanban boards, team collaboration, AI task generation, and simple billing — all in one place.",
  keywords: [
    "project management",
    "kanban board",
    "team collaboration",
    "task management",
    "productivity tool",
    "AI task generation",
  ],
  authors: [{ name: "Orbit" }],
  creator: "Orbit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Orbit",
    title: "Orbit — Project management for modern teams",
    description:
      "Orbit is the project management tool your team actually wants to use. Kanban boards, team collaboration, AI task generation, and simple billing — all in one place.",
    images: [
      {
        url: "/screenshot.png",
        width: 1440,
        height: 900,
        alt: "Orbit project management dashboard — kanban board showing tasks organised into Todo, In Progress, and Done columns with team member avatars and priority labels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit — Project management for modern teams",
    description:
      "Kanban boards, team collaboration, AI task generation. Built for teams that ship.",
    images: ["/screenshot.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
