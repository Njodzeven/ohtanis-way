import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"
import api from "@/lib/api"
import type { MandalaChartData } from "@/hooks/use-grid-data"
import { motion, AnimatePresence } from "framer-motion"

interface AiGeneratorModalProps {
    onGenerate: (data: MandalaChartData) => void
}

const LOADING_MESSAGES = [
    "Connecting to Coach...",
    "Analyzing your goal...",
    "Identifying key pillars...",
    "Structuring daily habits...",
    "Finalizing your chart..."
]

export function AiGeneratorModal({ onGenerate }: AiGeneratorModalProps) {
    const [open, setOpen] = useState(false)
    const [goal, setGoal] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (loading) {
            setLoadingMessageIndex(0)
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
            }, 2000)
        }
        return () => clearInterval(interval)
    }, [loading])

    const handleGenerate = async () => {
        if (!goal.trim()) return
        setLoading(true)
        setError("")

        try {
            const response = await api.post("/ai/analyze", { goal })
            const aiData = response.data

            const newData: MandalaChartData = {
                center: { id: "center", content: aiData.center_goal },
                pillars: aiData.pillars.map((p: any, i: number) => ({
                    id: `pillar-${i}`,
                    content: p.title,
                    tasks: p.tasks.map((t: string, j: number) => ({
                        id: `pillar-${i}-task-${j}`,
                        content: t
                    }))
                }))
            }

            onGenerate(newData)
            setOpen(false)
        } catch (err) {
            console.error("AI Generation failed:", err)
            setError("Failed to generate chart. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 font-serif border-primary/20 hover:bg-primary/5 text-foreground/80">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#fdfbf7] border-border/20 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl tracking-tight">AI Architect</DialogTitle>
                    <DialogDescription className="font-serif text-muted-foreground">
                        Enter your main goal. The architect will construct your path.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <Input
                            id="goal"
                            placeholder="e.g., Become the best baseball player in the world"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="font-serif text-lg border-b-2 border-t-0 border-x-0 rounded-none border-primary/20 focus-visible:ring-0 focus-visible:border-primary bg-transparent px-0 placeholder:text-muted-foreground/50"
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center space-y-3 py-4"
                            >
                                <div className="w-full h-1 bg-secondary/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary/60"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 10, ease: "linear" }}
                                    />
                                </div>
                                <p className="font-serif text-sm text-muted-foreground italic animate-pulse">
                                    {LOADING_MESSAGES[loadingMessageIndex]}
                                </p>
                            </motion.div>
                        ) : (
                            error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-500 font-serif"
                                >
                                    {error}
                                </motion.p>
                            )
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !goal.trim()}
                        className="font-serif w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-500"
                    >
                        {loading ? "Constructing..." : "Generate Chart"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
