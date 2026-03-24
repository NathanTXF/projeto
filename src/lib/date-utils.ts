/**
 * Utilitários de data para garantir resiliência temporal no sistema.
 */

/**
 * Gera um array de anos relativos a um ano base.
 * Útil para seletores que precisam mostrar anos passados e futuros.
 * 
 * @param baseYear O ano de referência (ex: new Date().getFullYear())
 * @param past Quantos anos para trás incluir
 * @param future Quantos anos para frente incluir
 * @returns Array de números ordenados (ex: [2024, 2025, 2026, 2027])
 */
export function generateYearRange(baseYear: number, past: number, future: number): number[] {
    const years: number[] = [];
    for (let i = baseYear - past; i <= baseYear + future; i++) {
        years.push(i);
    }
    return years;
}

/**
 * Retorna o ano atual como número.
 */
export function getCurrentYear(): number {
    return new Date().getFullYear();
}

/**
 * Retorna o mês atual (1-12).
 */
export function getCurrentMonth(): number {
    return new Date().getMonth() + 1;
}

/**
 * Normaliza um valor de ano vindo da UI e aplica limites de segurança.
 */
export function normalizeYear(
    yearLike: string | number,
    fallbackYear: number,
    minYear = 2000,
    maxYear = 2100
): number {
    const parsed = typeof yearLike === "number" ? yearLike : Number.parseInt(yearLike, 10);
    if (!Number.isFinite(parsed)) return fallbackYear;
    return Math.min(maxYear, Math.max(minYear, parsed));
}

/**
 * Constrói uma lista robusta de anos combinando:
 * - anos disponíveis no backend,
 * - janela dinâmica ao redor do ano atual,
 * - ano atualmente selecionado.
 */
export function buildYearOptions(params: {
    selectedYear: number;
    availableYears?: number[];
    baseYear?: number;
    past?: number;
    future?: number;
    minYear?: number;
    maxYear?: number;
}): number[] {
    const {
        selectedYear,
        availableYears = [],
        baseYear = getCurrentYear(),
        past = 10,
        future = 10,
        minYear = 2000,
        maxYear = 9999,
    } = params;

    const fromWindow = availableYears.length > 0 ? [] : generateYearRange(baseYear, past, future);
    const years = new Set<number>([...availableYears, ...fromWindow, selectedYear]);

    return Array.from(years)
        .filter((year) => year >= minYear && year <= maxYear)
        .sort((a, b) => b - a);
}

export interface MonthYearOption {
    value: string;
    label: string;
    month: number;
    year: number;
}

/**
 * Formata mês/ano no padrão esperado pelo backend: MM/YYYY.
 */
export function formatMesAno(month: number, year: number): string {
    return `${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Faz parse de MM/YYYY para objeto de mês e ano.
 */
export function parseMesAno(mesAno: string): { month: number; year: number } | null {
    const match = /^(\d{2})\/(\d{4})$/.exec(mesAno);
    if (!match) return null;

    const month = Number.parseInt(match[1], 10);
    const year = Number.parseInt(match[2], 10);

    if (!Number.isFinite(month) || !Number.isFinite(year) || month < 1 || month > 12) {
        return null;
    }

    return { month, year };
}

/**
 * Gera opções de período mensal em janela temporal flexível, mantendo o período selecionado.
 */
export function buildMesAnoOptions(params: {
    selectedMesAno?: string;
    monthsBack?: number;
    monthsForward?: number;
    baseDate?: Date;
    availableYears?: number[];
}): MonthYearOption[] {
    const {
        selectedMesAno,
        monthsBack = 24,
        monthsForward = 12,
        baseDate = new Date(),
        availableYears = [],
    } = params;

    const selected = selectedMesAno ? parseMesAno(selectedMesAno) : null;
    const selectedDate = selected ? new Date(selected.year, selected.month - 1, 1) : null;

    const all = new Map<string, MonthYearOption>();
    const formatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

    if (availableYears.length > 0) {
        const years = Array.from(new Set(availableYears)).sort((a, b) => b - a);
        for (const year of years) {
            for (let month = 12; month >= 1; month--) {
                const d = new Date(year, month - 1, 1);
                const value = formatMesAno(month, year);
                const rawLabel = formatter.format(d);
                const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                all.set(value, { value, label, month, year });
            }
        }
    } else {
        const startOffset = -monthsBack;
        const endOffset = monthsForward;

        for (let offset = startOffset; offset <= endOffset; offset++) {
            const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            const value = formatMesAno(month, year);
            const rawLabel = formatter.format(d);
            const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

            all.set(value, { value, label, month, year });
        }
    }

    if (selectedDate) {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        const value = formatMesAno(month, year);
        if (!all.has(value)) {
            const rawLabel = formatter.format(selectedDate);
            const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
            all.set(value, { value, label, month, year });
        }
    }

    return Array.from(all.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
}

/**
 * Retorna o intervalo ISO (yyyy-MM-dd) para um mês/ano.
 */
export function getMonthDateRange(month: number, year: number): { startDate: string; endDate: string } {
    const safeMonth = Math.min(12, Math.max(1, month));
    const start = new Date(year, safeMonth - 1, 1);
    const end = new Date(year, safeMonth, 0);

    const toIsoDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    return {
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
    };
}
