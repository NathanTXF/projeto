import { useMemo, useState } from "react";
import {
    buildMesAnoOptions,
    buildYearOptions,
    getCurrentYear,
    getMonthDateRange,
    normalizeYear,
} from "@/lib/date-utils";
import { useSalesYears } from "@/hooks/useSalesYears";

interface UseDateRangeCompetenciaParams {
    startDate: string;
    onRangeChange: (range: { startDate: string; endDate: string }) => void;
    monthsBack?: number;
    monthsForward?: number;
}

export function useDateRangeCompetencia({
    startDate,
    onRangeChange,
    monthsBack = 24,
    monthsForward = 12,
}: UseDateRangeCompetenciaParams) {
    const yearMin = 2000;
    const yearMax = 9999;
    const { years: salesYears } = useSalesYears();
    const now = new Date();
    const initialDate = new Date(startDate);
    const hasValidInitialDate = !Number.isNaN(initialDate.getTime());
    const [selectedMonth, setSelectedMonth] = useState<string>(
        hasValidInitialDate ? String(initialDate.getMonth() + 1) : String(now.getMonth() + 1)
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        hasValidInitialDate ? String(initialDate.getFullYear()) : String(now.getFullYear())
    );

    const periodOptions = useMemo(
        () => buildMesAnoOptions({ monthsBack, monthsForward, availableYears: salesYears }),
        [monthsBack, monthsForward, salesYears]
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

    const applyMonthYearRange = (monthText: string, yearText: string) => {
        const month = Number.parseInt(monthText, 10);
        const year = normalizeYear(yearText, getCurrentYear(), yearMin, yearMax);
        const range = getMonthDateRange(month, year);
        onRangeChange(range);
    };

    const onMonthChange = (month: string) => {
        setSelectedMonth(month);
        applyMonthYearRange(month, selectedYear);
    };

    const onYearChange = (year: string) => {
        setSelectedYear(year);
        applyMonthYearRange(selectedMonth, year);
    };

    const onPeriodChange = (value: string) => {
        const [monthText, yearText] = value.split("/");
        const normalizedMonth = String(Number.parseInt(monthText, 10));
        setSelectedMonth(normalizedMonth);
        setSelectedYear(yearText);
        applyMonthYearRange(normalizedMonth, yearText);
    };

    return {
        selectedMonth,
        selectedYear,
        periodOptions,
        yearOptions,
        onMonthChange,
        onYearChange,
        onPeriodChange,
    };
}
