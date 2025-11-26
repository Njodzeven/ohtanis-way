import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GridCellProps {
    id: string
    content: string
    isCenter?: boolean
    isSubgridCenter?: boolean
    onClick?: () => void
    onChange?: (value: string) => void
    className?: string
    readOnly?: boolean
    placeholder?: string
}

export function GridCell({ id, content, isCenter, isSubgridCenter, onClick, onChange, className, readOnly, placeholder }: GridCellProps) {
    return (
        <motion.div
            layoutId={id}
            onClick={onClick}
            whileHover={!readOnly ? { scale: 1.05, zIndex: 10 } : undefined}
            className={cn(
                "w-full h-full aspect-square flex items-center justify-center p-0.5 text-center border border-border/30 bg-card transition-all relative group overflow-hidden",
                // Base typography
                "text-[9px] sm:text-[10px] md:text-xs leading-tight font-serif",
                // Center Goal Styling
                isCenter && "bg-primary text-primary-foreground font-bold border-primary shadow-inner",
                // Subgrid Center Styling (Pillar Titles in outer grids)
                isSubgridCenter && "bg-secondary/50 font-semibold text-secondary-foreground",
                // Empty state styling
                !content && !placeholder && "bg-muted/20",
                className
            )}
        >
            {readOnly ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden px-0.5">
                    <span className="line-clamp-4 pointer-events-none select-none break-words w-full" title={content || placeholder}>
                        {content || placeholder}
                    </span>
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn(
                        "w-full h-full bg-transparent resize-none text-center focus:outline-none p-0.5",
                        isCenter ? "text-primary-foreground placeholder:text-primary-foreground/50" : "text-foreground placeholder:text-muted-foreground/50"
                    )}
                    placeholder={placeholder || "..."}
                    spellCheck={false}
                />
            )}
        </motion.div>
    )
}
