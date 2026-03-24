"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface YearNavigatorProps {
    selectedYear: string;
    yearOptions: number[];
    onYearChange: (year: string) => void;
    className?: string;
    selectTriggerClassName?: string;
    selectContentClassName?: string;
}

export function YearNavigator({
    selectedYear,
    yearOptions,
    onYearChange,
    className,
    selectTriggerClassName,
    selectContentClassName,
}: YearNavigatorProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <Select
                value={selectedYear}
                onValueChange={onYearChange}
            >
                <SelectTrigger className={cn("h-10 w-[112px]", selectTriggerClassName)}>
                    <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                    {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
