"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

export type KpiTone = "primary" | "emerald" | "amber" | "neutral"

const toneStyles: Record<KpiTone, { icon: string; pill: string; value: string }> = {
  primary: { icon: "bg-primary/10 text-primary", pill: "text-primary bg-primary/10", value: "text-foreground" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", pill: "text-emerald-600 bg-emerald-50", value: "text-foreground" },
  amber: { icon: "bg-amber-50 text-amber-600", pill: "text-amber-700 bg-amber-50", value: "text-foreground" },
  neutral: { icon: "bg-slate-100 text-slate-600", pill: "text-slate-600 bg-slate-100", value: "text-foreground" },
}

interface KpiCardProps {
  title: string
  value: React.ReactNode
  icon: LucideIcon
  tone?: KpiTone
  subtitle?: string
  href?: string
}

export const KpiCard = ({ title, value, icon: Icon, tone = "neutral", subtitle, href }: KpiCardProps) => {
  const toneClass = toneStyles[tone]
  const content = (
    <div className="h-full rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-lg transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", toneClass.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn("text-[10px] font-medium uppercase tracking-[0.2em] px-2 py-1 rounded-full", toneClass.pill)}>
          {title}
        </span>
      </div>
      <div>
        <p className={cn("text-2xl font-semibold leading-tight", toneClass.value)}>{value}</p>
        {subtitle && <p className="mt-1 text-[11px] text-muted-foreground font-medium leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl">
        {content}
      </Link>
    )
  }

  return content
}
