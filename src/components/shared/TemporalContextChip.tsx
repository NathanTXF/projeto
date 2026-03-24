import { LucideIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type TemporalTone = "competencia" | "exercicio" | "periodo" | "neutro";

interface TemporalContextChipProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    tone?: TemporalTone;
    className?: string;
}

const toneClasses: Record<TemporalTone, string> = {
    competencia: "border-sky-300/35 bg-sky-400/12 text-sky-50",
    exercicio: "border-amber-300/35 bg-amber-400/12 text-amber-50",
    periodo: "border-emerald-300/35 bg-emerald-400/12 text-emerald-50",
    neutro: "border-white/25 bg-white/10 text-white/85",
};

export function TemporalContextChip({
    label,
    value,
    icon: Icon = Calendar,
    tone = "competencia",
    className,
}: TemporalContextChipProps) {
    return (
        <p
            className={cn(
                "period-context-chip inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium",
                toneClasses[tone],
                className
            )}
        >
            <Icon className="h-3.5 w-3.5 opacity-90" />
            <span className="opacity-80">{label}:</span>
            <strong className="font-semibold tracking-[0.01em]">{value}</strong>
        </p>
    );
}