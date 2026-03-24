import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                data-slot="textarea"
                className={cn(
                    "flex min-h-[96px] w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm shadow-sm transition-[background-color,color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/95 outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:border-primary/65 focus-visible:ring-primary/20 focus-visible:ring-[3px]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
