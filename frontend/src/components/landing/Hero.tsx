
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface HeroProps {
    onCtaClick?: () => void
}

export function Hero({ onCtaClick }: HeroProps) {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-background text-foreground">
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-muted/20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl space-y-8 z-10"
            >
                <div className="space-y-2">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-sm md:text-base uppercase tracking-[0.2em] text-muted-foreground font-medium"
                    >
                        The Harada Method
                    </motion.span>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-foreground drop-shadow-sm">
                        Ohtani's Way
                    </h1>
                </div>

                <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed font-serif italic">
                    "Luck is something you create."
                </p>

                <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                    Digitize your dreams with the Mandala Chart. Define your core goal, establish your pillars, and track your daily habits to achieve the impossible.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Button
                        size="lg"
                        onClick={onCtaClick}
                        className="text-lg px-8 py-6 font-serif bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Create Your Chart
                    </Button>
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 font-serif border-foreground/20 hover:bg-foreground/5 transition-all duration-300">
                        Learn More
                    </Button>
                </div>
            </motion.div>

            {/* Decorative elements - Subtle paper texture effect using SVG noise */}
            <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply">
                <svg className="w-full h-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>
        </section>
    )
}
