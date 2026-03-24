"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { YearNavigator } from "@/components/shared/YearNavigator";

interface PeriodOption {
    value: string;
    label: string;
}

interface MonthYearNavigatorProps {
    selectedMonth: string;
    selectedYear: string;
    yearOptions: number[];
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
    className?: string;
    monthTriggerClassName?: string;
    monthContentClassName?: string;
    yearNavigatorClassName?: string;
    yearSelectTriggerClassName?: string;
    yearSelectContentClassName?: string;
    showMonthSelect?: boolean;
    showYearSelect?: boolean;
    period?: {
        value: string;
        onValueChange: (value: string) => void;
        options: PeriodOption[];
        triggerClassName?: string;
        contentClassName?: string;
        includeAllOption?: boolean;
        allValue?: string;
        allLabel?: string;
        placeholder?: string;
    };
}

const MONTHS = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
        value: String(month),
        label: new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(2026, index, 1)),
    };
});

export function MonthYearNavigator({
    selectedMonth,
    selectedYear,
    yearOptions,
    onMonthChange,
    onYearChange,
    className,
    monthTriggerClassName,
    monthContentClassName,
    yearNavigatorClassName,
    yearSelectTriggerClassName,
    yearSelectContentClassName,
    showMonthSelect = true,
    showYearSelect,
    period,
}: MonthYearNavigatorProps) {
    const resolvedShowYearSelect = showYearSelect ?? !(period && !showMonthSelect);

    return (
        <div className={cn("flex flex-wrap items-center gap-2 md:gap-3", className)}>
            {period && (
                <Select value={period.value} onValueChange={period.onValueChange}>
                    <SelectTrigger className={cn("h-10 w-full sm:w-[240px]", period.triggerClassName)}>
                        <SelectValue placeholder={period.placeholder ?? "Selecione competência"} />
                    </SelectTrigger>
                    <SelectContent className={period.contentClassName}>
                        {period.includeAllOption && (
                            <SelectItem value={period.allValue ?? "all"}>
                                {period.allLabel ?? "Todos os períodos"}
                            </SelectItem>
                        )}
                        {period.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {showMonthSelect && (
                <Select value={selectedMonth} onValueChange={onMonthChange}>
                    <SelectTrigger className={cn("h-10 w-full sm:w-[170px]", monthTriggerClassName)}>
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent className={monthContentClassName}>
                        {MONTHS.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {resolvedShowYearSelect && (
                <YearNavigator
                    selectedYear={selectedYear}
                    yearOptions={yearOptions}
                    onYearChange={onYearChange}
                    className={yearNavigatorClassName}
                    selectTriggerClassName={yearSelectTriggerClassName}
                    selectContentClassName={yearSelectContentClassName}
                />
            )}
        </div>
    );
}
