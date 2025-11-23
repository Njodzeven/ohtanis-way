import { useState, useEffect, useRef } from "react"
import { Hero } from "@/components/landing/Hero"
import { GridCanvas } from "@/components/grid/GridCanvas"
import { AuthForm } from "@/components/auth/AuthForm"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const gridSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  const scrollToGrid = () => {
    gridSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <Hero onCtaClick={scrollToGrid} />
      <section ref={gridSectionRef} className="py-20 bg-muted/30 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-10">The Mandala Chart</h2>
          {isAuthenticated ? (
            <GridCanvas />
          ) : (
            <div className="max-w-md mx-auto">
              <AuthForm onSuccess={() => setIsAuthenticated(true)} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
