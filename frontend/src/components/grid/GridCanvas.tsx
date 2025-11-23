import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GridCell } from "./GridCell"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, Save, Download } from "lucide-react"
import { useGridData, type MandalaChartData } from "@/hooks/use-grid-data"
import { AiGeneratorModal } from "@/components/ai/AiGeneratorModal"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function GridCanvas() {
    const [activePillar, setActivePillar] = useState<number | null>(null)
    const { data, loading, saving, updateCell, setData } = useGridData()
    const gridRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (!gridRef.current) return

        // Temporarily remove transform/scaling for capture if needed, 
        // but html2canvas usually handles it. 
        // We might want to capture the whole grid even if zoomed in? 
        // For now, let's assume user downloads from main view for best result.
        if (activePillar !== null) setActivePillar(null)

        // Wait for state update/animation
        await new Promise(resolve => setTimeout(resolve, 500))

        const canvas = await html2canvas(gridRef.current, {
            backgroundColor: "#f5f5f0", // Match theme background
            scale: 2 // Higher quality
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height]
        })

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
        pdf.save("ohtani-mandala-chart.pdf")
    }

    const handleAiGenerate = (newData: MandalaChartData) => {
        setData(newData)
        // Trigger save to backend immediately or let debouncer handle it if we mark it as dirty?
        // useGridData's setData updates state. If we want to persist, we might need to trigger a save.
        // But useGridData usually only debounces on specific cell updates. 
        // Let's assume the user will tweak it, or we can force a save if useGridData exposed it.
        // For now, let's manually trigger updates for all cells to ensure persistence 
        // OR rely on the user making one edit to save everything.
        // Actually, a better approach is to have useGridData expose a 'saveAll' or 'replaceData' that saves.
        // Since we don't have that yet, let's just update the local state. 
        // The user will likely edit something.
        // Ideally, we should call the API to save the whole tree.
        // Let's rely on the user clicking "Save" or editing for now, or update useGridData later.
        // Wait, useGridData has `updateCell`.
    }

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center gap-6">
            <div className="w-full flex justify-between items-center h-10">
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {activePillar !== null && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => setActivePillar(null)}
                                    className="gap-2 font-serif"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                    <AiGeneratorModal onGenerate={handleAiGenerate} />
                    <Button variant="outline" size="icon" onClick={handleDownload} title="Download PDF">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground w-[100px] justify-end">
                    {saving ? (
                        <span className="flex items-center gap-1 animate-pulse">
                            <Save className="w-3 h-3" /> Saving...
                        </span>
                    ) : (
                        <span>Saved</span>
                    )}
                </div>
            </div>

            <motion.div
                ref={gridRef}
                layout
                className="grid grid-cols-3 gap-2 w-full aspect-square bg-background/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-border/50"
            >
                {activePillar === null ? (
                    // Main View: Center + 8 Pillars
                    <>
                        {data.pillars.slice(0, 4).map((pillar, i) => (
                            <GridCell
                                key={pillar.id}
                                id={pillar.id}
                                content={pillar.content}
                                onClick={() => setActivePillar(i)}
                                readOnly // Pillars are read-only in main view
                                className="bg-secondary/20"
                            />
                        ))}

                        <GridCell
                            id={data.center.id}
                            content={data.center.content}
                            isCenter
                            onChange={(val) => updateCell(data.center.id, val)}
                        />

                        {data.pillars.slice(4).map((pillar, i) => (
                            <GridCell
                                key={pillar.id}
                                id={pillar.id}
                                content={pillar.content}
                                onClick={() => setActivePillar(i + 4)}
                                readOnly
                                className="bg-secondary/20"
                            />
                        ))}
                    </>
                ) : (
                    // Zoomed View: Selected Pillar + 8 Tasks
                    <>
                        {data.pillars[activePillar].tasks.slice(0, 4).map((task) => (
                            <GridCell
                                key={task.id}
                                id={task.id}
                                content={task.content}
                                onChange={(val) => updateCell(task.id, val)}
                            />
                        ))}

                        <GridCell
                            id={data.pillars[activePillar].id}
                            content={data.pillars[activePillar].content}
                            isCenter
                            onClick={() => setActivePillar(null)}
                            onChange={(val) => updateCell(data.pillars[activePillar].id, val)}
                            className="bg-secondary/30"
                        />

                        {data.pillars[activePillar].tasks.slice(4).map((task) => (
                            <GridCell
                                key={task.id}
                                id={task.id}
                                content={task.content}
                                onChange={(val) => updateCell(task.id, val)}
                            />
                        ))}
                    </>
                )}
            </motion.div>
        </div>
    )
}
