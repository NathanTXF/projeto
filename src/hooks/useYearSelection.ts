import { useMemo, useState } from "react";
import { buildYearOptions, getCurrentYear, normalizeYear } from "@/lib/date-utils";
import { useSalesYears } from "@/hooks/useSalesYears";

interface UseYearSelectionParams {
    initialYear?: string;
    availableYears?: number[];
    past?: number;
    future?: number;
    baseYear?: number;
}

export function useYearSelection({
    initialYear = String(getCurrentYear()),
    availableYears = [],
    past = 12,
    future = 15,
    baseYear = getCurrentYear(),
}: UseYearSelectionParams = {}) {
    const yearMin = 2000;
    const yearMax = 9999;
    const { years: salesYears } = useSalesYears();
    const [selectedYear, setSelectedYear] = useState<string>(initialYear);

    const mergedAvailableYears = useMemo(
        () => Array.from(new Set([...(salesYears || []), ...availableYears])).sort((a, b) => b - a),
        [salesYears, availableYears]
    );

    const yearOptions = useMemo(
        () => buildYearOptions({
            selectedYear: normalizeYear(selectedYear, baseYear, yearMin, yearMax),
            availableYears: mergedAvailableYears,
            baseYear,
            past,
            future,
            minYear: yearMin,
            maxYear: yearMax,
        }),
        [selectedYear, mergedAvailableYears, baseYear, past, future, yearMin, yearMax]
    );

    return {
        selectedYear,
        setSelectedYear,
        yearOptions,
    };
}
