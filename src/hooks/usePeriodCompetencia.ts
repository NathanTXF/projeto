import { useMemo, useState } from "react";
import {
    buildMesAnoOptions,
    buildYearOptions,
    formatMesAno,
    getCurrentYear,
    normalizeYear,
    parseMesAno,
} from "@/lib/date-utils";
import { useSalesYears } from "@/hooks/useSalesYears";

interface UsePeriodCompetenciaParams {
    monthsBack?: number;
    monthsForward?: number;
    initialPeriod?: string;
}

export function usePeriodCompetencia({
    monthsBack = 24,
    monthsForward = 12,
    initialPeriod = "all",
}: UsePeriodCompetenciaParams = {}) {
    const yearMin = 2000;
    const yearMax = 9999;
    const { years: salesYears } = useSalesYears();
    const now = new Date();
    const initialParsed = initialPeriod !== "all" ? parseMesAno(initialPeriod) : null;
    const [period, setPeriod] = useState<string>(initialPeriod);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        initialParsed ? String(initialParsed.month) : String(now.getMonth() + 1)
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        initialParsed ? String(initialParsed.year) : String(now.getFullYear())
    );

    const periodOptions = useMemo(
        () => buildMesAnoOptions({
            selectedMesAno: period === "all" ? undefined : period,
            monthsBack,
            monthsForward,
            availableYears: salesYears,
        }),
        [period, monthsBack, monthsForward, salesYears]
    );

    const yearOptions = useMemo(
        () => buildYearOptions({
            selectedYear: normalizeYear(selectedYear, getCurrentYear(), yearMin, yearMax),
            availableYears: salesYears,
            past: 12,
            future: 15,
            minYear: yearMin,
            maxYear: yearMax,
        }),
        [selectedYear, salesYears, yearMin, yearMax]
    );

    const syncPeriod = (month: string, year: string) => {
        const monthNumber = Number.parseInt(month, 10);
        const yearNumber = Number.parseInt(year, 10);
        if (!Number.isFinite(monthNumber) || !Number.isFinite(yearNumber)) return;
        setPeriod(formatMesAno(monthNumber, yearNumber));
    };

    const onMonthChange = (month: string) => {
        setSelectedMonth(month);
        syncPeriod(month, selectedYear);
    };

    const onYearChange = (year: string) => {
        setSelectedYear(year);
        syncPeriod(selectedMonth, year);
    };

    return {
        period,
        setPeriod,
        selectedMonth,
        selectedYear,
        periodOptions,
        yearOptions,
        onMonthChange,
        onYearChange,
    };
}
