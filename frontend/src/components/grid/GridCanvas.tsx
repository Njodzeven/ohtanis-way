import { useRef } from "react"
import { motion } from "framer-motion"
import { GridCell } from "./GridCell"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Download } from "lucide-react"
import { useGridData, type MandalaChartData } from "@/hooks/use-grid-data"
import { AiGeneratorModal } from "@/components/ai/AiGeneratorModal"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { SHOHEI_OHTANI_DATA } from "@/lib/shohei-data"
import { toast } from "sonner"

interface GridCanvasProps {
    mode?: 'api' | 'guest' | 'static'
    initialData?: MandalaChartData
    readOnly?: boolean
}

export function GridCanvas({ mode = 'api', initialData, readOnly }: GridCanvasProps) {
    const { data, loading, saving, updateCell, setData } = useGridData({ mode, initialData })
    const gridRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (!gridRef.current || !data) return

        // Validate that all cells are filled
        let isComplete = true;
        if (!data.center.content) isComplete = false;
        data.pillars.forEach(p => {
            if (!p.content) isComplete = false;
            p.tasks.forEach(t => {
                if (!t.content) isComplete = false;
            })
        });

        if (!isComplete) {
            toast.error("Please fill in all cells before downloading.", {
                description: "The Mandala Chart requires every field to be completed."
            });
            return;
        }

        try {
            // Clone the element to avoid modifying the actual DOM
            const clone = gridRef.current.cloneNode(true) as HTMLElement;
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            document.body.appendChild(clone);

            // Force inline styles with computed values to bypass oklch parsing
            const applyComputedStyles = (element: HTMLElement, original: HTMLElement) => {
                const computedStyle = window.getComputedStyle(original);

                // Apply critical color properties as inline styles
                element.style.backgroundColor = computedStyle.backgroundColor;
                element.style.color = computedStyle.color;
                element.style.borderColor = computedStyle.borderTopColor; // border colors
                element.style.borderTopColor = computedStyle.borderTopColor;
                element.style.borderRightColor = computedStyle.borderRightColor;
                element.style.borderBottomColor = computedStyle.borderBottomColor;
                element.style.borderLeftColor = computedStyle.borderLeftColor;

                // Recursively apply to children
                Array.from(element.children).forEach((child, index) => {
                    const originalChild = original.children[index] as HTMLElement;
                    if (originalChild) {
                        applyComputedStyles(child as HTMLElement, originalChild);
                    }
                });
            };

            applyComputedStyles(clone, gridRef.current);

            const canvas = await html2canvas(clone, {
                backgroundColor: "#f5f5f0",
                scale: 3,
                useCORS: true,
                logging: false,
                ignoreElements: () => {
                    // Ignore any problematic elements
                    return false;
                }
            });

            // Clean up clone
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save("ohtani-mandala-chart.pdf");

            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download PDF. Please try again.");
        }
    }

    const handleAiGenerate = (newData: MandalaChartData) => {
        setData(newData)
    }

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Use Shohei's data for placeholders if data is missing or empty
    const getPlaceholder = (type: 'center' | 'pillar' | 'task', pillarIndex?: number, taskIndex?: number) => {
        if (type === 'center') return SHOHEI_OHTANI_DATA.center.content;
        if (type === 'pillar' && pillarIndex !== undefined) {
            return SHOHEI_OHTANI_DATA.pillars[pillarIndex]?.content;
        }
        if (type === 'task' && pillarIndex !== undefined && taskIndex !== undefined) {
            return SHOHEI_OHTANI_DATA.pillars[pillarIndex]?.tasks[taskIndex]?.content;
        }
        return "...";
    }

    if (!data) return null

    // Helper to render a 3x3 subgrid
    const renderSubgrid = (row: number, col: number) => {
        // Determine which section of the 9x9 grid this is
        // 0 1 2
        // 3 4 5
        // 6 7 8
        const sectionIndex = row * 3 + col;

        const ArrowsOverlay = () => (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0">
                <svg viewBox="0 0 100 100" className="w-full h-full p-6">
                    <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="currentColor" className="text-foreground" />
                        </marker>
                    </defs>
                    <line x1="42" y1="42" x2="25" y2="25" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="50" y1="40" x2="50" y2="15" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="58" y1="42" x2="75" y2="25" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="40" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="60" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="42" y1="58" x2="25" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="50" y1="60" x2="50" y2="85" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                    <line x1="58" y1="58" x2="75" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" className="text-foreground" />
                </svg>
            </div>
        )

        // Center Section (Index 4) -> Main Goal + Pillar Titles
        if (sectionIndex === 4) {
            return (
                <div key="center-subgrid" className="grid grid-cols-3 gap-1 p-1 border-2 border-primary/20 rounded-lg bg-primary/5 relative">
                    <ArrowsOverlay />
                    {/* Top Row: Pillars 0, 1, 2 */}
                    {[0, 1, 2].map(i => (
                        <GridCell
                            key={data.pillars[i].id}
                            id={data.pillars[i].id}
                            content={data.pillars[i].content}
                            placeholder={getPlaceholder('pillar', i)}
                            onChange={(val) => updateCell(data.pillars[i].id, val)}
                            isSubgridCenter
                            readOnly={readOnly}
                            className="z-10 bg-card/80 backdrop-blur-sm"
                        />
                    ))}
                    {/* Mid Row: Pillar 3, CENTER, Pillar 4 */}
                    <GridCell
                        id={data.pillars[3].id}
                        content={data.pillars[3].content}
                        placeholder={getPlaceholder('pillar', 3)}
                        onChange={(val) => updateCell(data.pillars[3].id, val)}
                        isSubgridCenter
                        readOnly={readOnly}
                        className="z-10 bg-card/80 backdrop-blur-sm"
                    />
                    <GridCell
                        id={data.center.id}
                        content={data.center.content}
                        placeholder={getPlaceholder('center')}
                        onChange={(val) => updateCell(data.center.id, val)}
                        isCenter
                        className="text-sm md:text-base z-10"
                        readOnly={readOnly}
                    />
                    <GridCell
                        id={data.pillars[4].id}
                        content={data.pillars[4].content}
                        placeholder={getPlaceholder('pillar', 4)}
                        onChange={(val) => updateCell(data.pillars[4].id, val)}
                        isSubgridCenter
                        readOnly={readOnly}
                        className="z-10 bg-card/80 backdrop-blur-sm"
                    />
                    {/* Bot Row: Pillars 5, 6, 7 */}
                    {[5, 6, 7].map(i => (
                        <GridCell
                            key={data.pillars[i].id}
                            id={data.pillars[i].id}
                            content={data.pillars[i].content}
                            placeholder={getPlaceholder('pillar', i)}
                            onChange={(val) => updateCell(data.pillars[i].id, val)}
                            isSubgridCenter
                            readOnly={readOnly}
                            className="z-10 bg-card/80 backdrop-blur-sm"
                        />
                    ))}
                </div>
            )
        }

        // Outer Sections -> Pillar + Tasks
        // Map sectionIndex to Pillar Index
        // Section 0 -> Pillar 0
        // Section 1 -> Pillar 1
        // ...
        // Section 4 is skipped (handled above)
        // Section 5 -> Pillar 4
        // ...
        const pillarIndex = sectionIndex < 4 ? sectionIndex : sectionIndex - 1;
        const pillar = data.pillars[pillarIndex];

        return (
            <div key={`pillar-${pillarIndex}`} className="grid grid-cols-3 gap-1 p-1 border border-border/20 rounded-lg hover:bg-accent/5 transition-colors relative">
                <ArrowsOverlay />
                {/* Tasks 0-2 */}
                {pillar.tasks.slice(0, 3).map((task, i) => (
                    <GridCell
                        key={task.id}
                        id={task.id}
                        content={task.content}
                        placeholder={getPlaceholder('task', pillarIndex, i)}
                        onChange={(val) => updateCell(task.id, val)}
                        readOnly={readOnly}
                        className="z-10 bg-card/80 backdrop-blur-sm"
                    />
                ))}
                {/* Task 3, Pillar Title (Center), Task 4 */}
                <GridCell
                    id={pillar.tasks[3].id}
                    content={pillar.tasks[3].content}
                    placeholder={getPlaceholder('task', pillarIndex, 3)}
                    onChange={(val) => updateCell(pillar.tasks[3].id, val)}
                    readOnly={readOnly}
                    className="z-10 bg-card/80 backdrop-blur-sm"
                />
                <GridCell
                    id={`subcenter-${pillar.id}`} // Unique ID for display only
                    content={pillar.content}
                    placeholder={getPlaceholder('pillar', pillarIndex)}
                    readOnly={true} // Always read-only as it mirrors the center grid
                    isSubgridCenter
                    className="bg-secondary/20 font-semibold z-10"
                />
                <GridCell
                    id={pillar.tasks[4].id}
                    content={pillar.tasks[4].content}
                    placeholder={getPlaceholder('task', pillarIndex, 4)}
                    onChange={(val) => updateCell(pillar.tasks[4].id, val)}
                    readOnly={readOnly}
                    className="z-10 bg-card/80 backdrop-blur-sm"
                />
                {/* Tasks 5-7 */}
                {pillar.tasks.slice(5, 8).map((task, i) => (
                    <GridCell
                        key={task.id}
                        id={task.id}
                        content={task.content}
                        placeholder={getPlaceholder('task', pillarIndex, i + 5)}
                        onChange={(val) => updateCell(task.id, val)}
                        readOnly={readOnly}
                        className="z-10 bg-card/80 backdrop-blur-sm"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto p-2 md:p-8 flex flex-col items-center justify-center gap-6">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-serif font-bold text-primary">Ohtani's Way</h1>
                </div>

                <div className="flex items-center gap-2">
                    {!readOnly && <AiGeneratorModal onGenerate={handleAiGenerate} />}
                    <Button variant="outline" size="icon" onClick={handleDownload} title="Download PDF">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground w-[100px] justify-end">
                    {!readOnly && (
                        saving ? (
                            <span className="flex items-center gap-1 animate-pulse">
                                <Save className="w-3 h-3" /> Saving...
                            </span>
                        ) : (
                            <span>Saved</span>
                        )
                    )}
                </div>
            </div>

            <motion.div
                ref={gridRef}
                layout
                className="grid grid-cols-3 gap-2 md:gap-4 w-full aspect-square bg-[#f5f5f0] p-2 md:p-6 rounded-xl shadow-lg border border-[#e6e6e0]"
            >
                {/* Render 9 Subgrids */}
                {[0, 1, 2].map(row => (
                    [0, 1, 2].map(col => renderSubgrid(row, col))
                ))}
            </motion.div>
        </div>
    )
}
