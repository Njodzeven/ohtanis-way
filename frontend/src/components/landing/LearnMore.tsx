import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export function LearnMore() {
    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-muted/20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto relative z-10 space-y-12"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="group font-serif pl-0 hover:bg-transparent hover:text-primary"
                >
                    <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Button>

                <header className="space-y-4 border-b border-border/40 pb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">The Origin of Greatness</h1>
                    <p className="text-xl text-muted-foreground font-serif italic">How a high school student planned his way to history.</p>
                </header>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold">Shohei Ohtani's High School Goal</h2>
                    <p className="leading-relaxed text-lg text-foreground/90">
                        Long before he became a global baseball icon, Shohei Ohtani was a 17-year-old student at Hanamaki Higashi High School with an impossible dream: to be drafted first overall by eight MLB teams. To achieve this, he didn't just practice aimlessly; he used a structured tool known as the **Mandala Chart** (or Open Window 64).
                    </p>
                    <p className="leading-relaxed text-lg text-foreground/90">
                        At the center of his chart was his core goal: <span className="font-bold">"Drafted #1 by 8 Teams"</span>. Surrounding this were 8 pillars he identified as crucial for success: Control, Kire (Sharpness), Speed 160km/h, Change of Pace, Luck, Human Character, Mental Strength, and Body Building.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold">The Harada Method</h2>
                    <p className="leading-relaxed text-lg text-foreground/90">
                        Developed by Takashi Harada, a junior high school track and field teacher in Osaka, the Harada Method is designed to turn "intangible" dreams into "tangible" actions. It emphasizes that success is not just about skill, but about **character** and **routine**.
                    </p>
                    <p className="leading-relaxed text-lg text-foreground/90">
                        Ohtani's inclusion of "Luck" and "Human Character" as pillars demonstrates this philosophy. He broke down "Luck" into actionable habits like "Cleaning the bathroom," "Picking up trash," and "Greeting others." He believed that by being a good person and respecting his environment, the game would respect him back.
                    </p>
                </section>

                <section className="space-y-6 border-t border-border/40 pt-8">
                    <h2 className="text-2xl font-serif font-bold">Why It Works</h2>
                    <ul className="space-y-4 list-disc list-inside text-lg text-foreground/90 marker:text-primary">
                        <li><span className="font-bold">Visual Clarity:</span> You see your entire plan in a single view.</li>
                        <li><span className="font-bold">Balance:</span> It forces you to consider all aspects of success, including mental and physical health.</li>
                        <li><span className="font-bold">Actionable:</span> It breaks vague ambitions into 64 specific daily tasks.</li>
                    </ul>
                </section>

                <div className="pt-8 flex justify-center">
                    <Button
                        size="lg"
                        onClick={() => navigate("/")}
                        className="text-lg px-8 py-6 font-serif bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    >
                        Start Your Own Chart
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
