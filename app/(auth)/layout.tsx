import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0b", color: "#fafafa" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
