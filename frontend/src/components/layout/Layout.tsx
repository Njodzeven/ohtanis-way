import { Link, Outlet, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AdBanner } from "@/components/ads/AdBanner"
import { LogOut, LayoutGrid, History as HistoryIcon } from "lucide-react"

export function Layout() {
    const location = useLocation()
    const isAuth = true // Replace with actual auth check later

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f0] font-sans text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-serif font-bold text-xl">
                        <Link to="/" className="flex items-center gap-2">
                            <span>Ohtani's Way</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-4">
                        {isAuth ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant={location.pathname === "/dashboard" ? "secondary" : "ghost"} size="sm" className="gap-2">
                                        <LayoutGrid className="w-4 h-4" />
                                        <span className="hidden sm:inline">Grid</span>
                                    </Button>
                                </Link>
                                <Link to="/history">
                                    <Button variant={location.pathname === "/history" ? "secondary" : "ghost"} size="sm" className="gap-2">
                                        <HistoryIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">History</span>
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </>
                        ) : (
                            <Link to="/login">
                                <Button size="sm">Login</Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 container max-w-screen-2xl py-6 px-4">
                <Outlet />
            </main>

            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with the Harada Method. Inspired by Shohei Ohtani.
                    </p>
                </div>
                <AdBanner />
            </footer>
        </div>
    )
}
