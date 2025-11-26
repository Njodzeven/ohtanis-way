import { useState, useEffect, useRef } from "react"
import { Hero } from "@/components/landing/Hero"
import { GridCanvas } from "@/components/grid/GridCanvas"
import { AuthForm } from "@/components/auth/AuthForm"
import { Button } from "@/components/ui/button"
import { SHOHEI_OHTANI_DATA } from "@/lib/shohei-data"

export function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isGuest, setIsGuest] = useState(false)
    const gridSectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        setIsAuthenticated(!!token)

        // Listen for auth changes
        const handleLogout = () => {
            setIsAuthenticated(false)
            setIsGuest(false)
        }

        window.addEventListener('auth:logout', handleLogout)
        return () => window.removeEventListener('auth:logout', handleLogout)
    }, [])

    const scrollToGrid = () => {
        gridSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleGuestMode = () => {
        setIsGuest(true)
        scrollToGrid()
    }

    return (
        <main className="min-h-screen bg-background font-sans antialiased">
            <Hero onCtaClick={handleGuestMode} />

            {/* Shohei Ohtani Example Section */}
            <section className="py-20 bg-muted/10 border-y border-border/40">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Master the Art of Goal Setting</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-12 text-lg">
                        See how Shohei Ohtani used the Mandala Chart to become the world's best baseball player.
                        This "Open Window 64" structure turns one big dream into 64 actionable steps.
                    </p>
                    <div className="pointer-events-none select-none opacity-90 scale-90 md:scale-100 origin-top">
                        <GridCanvas mode="static" initialData={SHOHEI_OHTANI_DATA} readOnly />
                    </div>
                </div>
            </section>

            <section ref={gridSectionRef} className="py-20 bg-muted/30 min-h-screen flex items-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-serif font-bold text-center mb-10">
                        {isAuthenticated || isGuest ? "Your Mandala Chart" : "Start Your Journey"}
                    </h2>

                    {isAuthenticated ? (
                        <GridCanvas mode="api" />
                    ) : isGuest ? (
                        <div className="space-y-6">
                            <div className="bg-card p-4 rounded-lg border border-border/50 max-w-2xl mx-auto text-center mb-8 shadow-sm">
                                <p className="text-sm text-muted-foreground">
                                    You are in <strong>Guest Mode</strong>. Your chart is saved locally in your browser.
                                    <br />To access your chart from other devices, please <Button variant="link" className="h-auto p-0" onClick={() => setIsGuest(false)}>log in or register</Button>.
                                </p>
                            </div>
                            <GridCanvas mode="guest" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
                            <div className="space-y-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold">Create a Guest Chart</h3>
                                <p className="text-muted-foreground">
                                    Jump right in and start planning immediately. Your data will be stored locally on this device.
                                </p>
                                <Button size="lg" onClick={handleGuestMode} className="w-full md:w-auto">
                                    Create Grid (Guest)
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-bold">Save & Sync</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create an account to save your progress to the cloud and access it anywhere.
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border shadow-sm">
                                    <AuthForm onSuccess={() => setIsAuthenticated(true)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
