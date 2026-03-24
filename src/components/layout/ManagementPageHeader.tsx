import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface HeaderAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
}

interface ManagementPageHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: HeaderAction;
    stats?: ReactNode;
    children?: ReactNode;
}

export function ManagementPageHeader({
    icon: Icon,
    title,
    description,
    action,
    stats,
    children,
}: ManagementPageHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0A2F52] to-[#05325E] p-4 sm:p-6 md:p-8 border border-white/10 shadow-[0_22px_56px_rgba(5,50,94,0.26)]">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/15 blur-[90px]" />
            <div className="relative flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20 shrink-0">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-primary-foreground leading-tight">{title}</h1>
                        <p className="mt-1 text-primary-foreground/85 font-medium text-xs md:text-sm">{description}</p>
                    </div>
                </div>

                {action && (
                    <Button
                        onClick={action.onClick}
                        variant={action.variant ?? "secondary"}
                        className="ui-lift ui-focus-ring ui-press gap-2 rounded-lg font-semibold shadow-sm px-4 sm:px-6 py-3 w-full sm:w-auto"
                    >
                        {action.icon && <action.icon className="h-5 w-5" />}
                        {action.label}
                    </Button>
                )}
            </div>

            {children}

            {stats && <div className="relative mt-7">{stats}</div>}
        </div>
    );
}
