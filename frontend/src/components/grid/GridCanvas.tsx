import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GridCell } from "./GridCell"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Download, ZoomIn, ArrowLeft } from "lucide-react"
import { useGridData, type MandalaChartData } from "@/hooks/use-grid-data"
import { AiGeneratorModal } from "@/components/ai/AiGeneratorModal"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { SHOHEI_OHTANI_DATA } from "@/lib/shohei-data"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface GridCanvasProps {
    mode?: 'api' | 'guest' | 'static'
    initialData?: MandalaChartData
    readOnly?: boolean
}

export function GridCanvas({ mode = 'api', initialData, readOnly }: GridCanvasProps) {
    const [searchParams] = useSearchParams()
    const chartId = searchParams.get('id')
    const { data, loading, saving, updateCell, setData } = useGridData({ mode, initialData, chartId })
    const gridRef = useRef<HTMLDivElement>(null)
    const [zoomedSection, setZoomedSection] = useState<number | null>(null)
    const [showDownloadDialog, setShowDownloadDialog] = useState(false)
    const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('pdf')

    // Reset zoom when data changes or on mount
    useEffect(() => {
        setZoomedSection(null)
    }, [chartId])

    const handleDownloadClick = () => {
        // Validate that all cells are filled
        if (!data) return

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

        setShowDownloadDialog(true)
    }

    const executeDownload = async () => {
        if (!gridRef.current) return
        setShowDownloadDialog(false)

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
                scale: 2, // Lower scale for better performance
                useCORS: true,
                logging: false,
            });

            document.body.removeChild(clone);

            if (downloadFormat === 'png') {
                const link = document.createElement('a');
                link.download = 'ohtani-mandala-chart.png';
                link.href = canvas.toDataURL();
                link.click();
            } else {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "px",
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
                pdf.save("ohtani-mandala-chart.pdf");
            }

            toast.success(`${downloadFormat.toUpperCase()} downloaded successfully!`);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download. Please try again.");
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

    const renderSubgrid = (row: number, col: number) => {
        const sectionIndex = row * 3 + col;
        const isCenter = sectionIndex === 4;

        // If zoomed, only show the zoomed section
        if (zoomedSection !== null && zoomedSection !== sectionIndex) return null;

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

        const commonGridProps = {
            className: `grid grid-cols-3 gap-1 p-1 border rounded-lg relative transition-all duration-300 ${zoomedSection === sectionIndex ? 'w-full h-full border-primary/50 shadow-2xl' : 'border-border/20 hover:bg-accent/5 cursor-pointer'
                }`,
            onClick: () => {
                if (zoomedSection === null) setZoomedSection(sectionIndex)
            }
        }

        if (isCenter) {
            return (
                <div key="center-subgrid" {...commonGridProps} className={`${commonGridProps.className} border-2 border-primary/20 bg-primary/5`}>
                    <ArrowsOverlay />
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

        const pillarIndex = sectionIndex < 4 ? sectionIndex : sectionIndex - 1;
        const pillar = data.pillars[pillarIndex];

        return (
            <div key={`pillar-${pillarIndex}`} {...commonGridProps}>
                <ArrowsOverlay />
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
                <GridCell
                    id={pillar.tasks[3].id}
                    content={pillar.tasks[3].content}
                    placeholder={getPlaceholder('task', pillarIndex, 3)}
                    onChange={(val) => updateCell(pillar.tasks[3].id, val)}
                    readOnly={readOnly}
                    className="z-10 bg-card/80 backdrop-blur-sm"
                />
                <GridCell
                    id={`subcenter-${pillar.id}`}
                    content={pillar.content}
                    placeholder={getPlaceholder('pillar', pillarIndex)}
                    readOnly={true}
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
                    {zoomedSection !== null && (
                        <Button variant="ghost" size="icon" onClick={() => setZoomedSection(null)}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-serif font-bold text-primary">
                        {zoomedSection !== null ? (zoomedSection === 4 ? "Central Goal" : `Pillar ${zoomedSection < 4 ? zoomedSection + 1 : zoomedSection}`) : "Ohtani's Way"}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {!readOnly && <AiGeneratorModal onGenerate={handleAiGenerate} />}
                    <Button variant="outline" size="icon" onClick={handleDownloadClick} title="Download">
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
                className={`w-full aspect-square bg-[#f5f5f0] p-2 md:p-6 rounded-xl shadow-lg border border-[#e6e6e0] transition-all duration-500 ${zoomedSection !== null ? 'flex items-center justify-center' : 'grid grid-cols-3 gap-2 md:gap-4'
                    }`}
            >
                {/* Render 9 Subgrids */}
                {[0, 1, 2].map(row => (
                    [0, 1, 2].map(col => renderSubgrid(row, col))
                ))}
            </motion.div>

            <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Download Chart</DialogTitle>
                        <DialogDescription>
                            Choose your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <RadioGroup defaultValue="pdf" value={downloadFormat} onValueChange={(v: string) => setDownloadFormat(v as 'png' | 'pdf')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf">PDF Document</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="png" id="png" />
                                <Label htmlFor="png">PNG Image</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button onClick={executeDownload}>Download</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
