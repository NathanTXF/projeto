import { useEffect, useState } from "react";
import { getCurrentYear } from "@/lib/date-utils";

export function useSalesYears() {
    const currentYear = getCurrentYear();
    const [years, setYears] = useState<number[]>([currentYear]);

    useEffect(() => {
        let isMounted = true;

        const fetchYears = async () => {
            try {
                const response = await fetch("/api/dashboard/years", { cache: "no-store" });
                if (!response.ok) return;

                const payload = (await response.json()) as { years?: unknown };
                const nextYears = Array.isArray(payload.years)
                    ? payload.years
                        .map((year) => Number(year))
                        .filter((year) => Number.isInteger(year))
                    : [];

                if (!isMounted) return;

                if (nextYears.length > 0) {
                    setYears(Array.from(new Set(nextYears)).sort((a, b) => b - a));
                }
            } catch {
                // Mantém fallback local quando não for possível carregar o backend.
            }
        };

        fetchYears();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        years,
    };
}