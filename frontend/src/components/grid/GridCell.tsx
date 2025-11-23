import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GridCellProps {
    id: string
    content: string
    isCenter?: boolean
    onClick?: () => void
    onChange?: (value: string) => void
    className?: string
    readOnly?: boolean
}

export function GridCell({ id, content, isCenter, onClick, onChange, className, readOnly }: GridCellProps) {
    return (
        <motion.div
            layoutId={id}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "aspect-square flex items-center justify-center p-1 text-center text-sm border border-border/40 bg-card transition-colors hover:bg-accent/50 relative group",
                isCenter && "bg-primary/5 font-bold text-primary border-primary/20",
                className
            )}
        >
            {readOnly ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden px-1">
                    <span className="line-clamp-3 text-xs sm:text-sm font-serif pointer-events-none select-none break-words leading-tight" title={content}>
                        {content}
                    </span>
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => onChange?.(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering zoom when editing
                    className="w-full h-full bg-transparent resize-none text-center text-xs sm:text-sm font-serif focus:outline-none p-1 leading-tight"
                    placeholder="..."
                />
            )}

            {/* Click overlay for zooming (only if onClick provided and not currently editing) */}
            {onClick && (
                <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={onClick}
                />
            )}
        </motion.div>
    )
}
