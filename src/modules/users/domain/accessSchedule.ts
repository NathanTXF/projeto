const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type WeekDayKey = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export interface DayAccessWindow {
    enabled: boolean;
    start: string;
    end: string;
}

export type AccessScheduleMap = Record<WeekDayKey, DayAccessWindow>;

export interface UserAccessSource {
    diasAcesso?: string | null;
    horarioInicio?: string | null;
    horarioFim?: string | null;
    horarioInicioFds?: string | null;
    horarioFimFds?: string | null;
}

const WEEKDAY_KEYS: WeekDayKey[] = ["1", "2", "3", "4", "5"];
const WEEKEND_KEYS: WeekDayKey[] = ["0", "6"];

function validTimeOrFallback(time: string | null | undefined, fallback: string): string {
    return typeof time === "string" && TIME_PATTERN.test(time) ? time : fallback;
}

export function buildDefaultAccessSchedule(
    defaultStart = "08:00",
    defaultEnd = "18:00"
): AccessScheduleMap {
    return {
        "0": { enabled: false, start: defaultStart, end: defaultEnd },
        "1": { enabled: true, start: defaultStart, end: defaultEnd },
        "2": { enabled: true, start: defaultStart, end: defaultEnd },
        "3": { enabled: true, start: defaultStart, end: defaultEnd },
        "4": { enabled: true, start: defaultStart, end: defaultEnd },
        "5": { enabled: true, start: defaultStart, end: defaultEnd },
        "6": { enabled: false, start: defaultStart, end: defaultEnd },
    };
}

function tryParseJsonSchedule(raw: string): AccessScheduleMap | null {
    try {
        const parsed = JSON.parse(raw) as { days?: Record<string, Partial<DayAccessWindow>> };
        if (!parsed || typeof parsed !== "object" || !parsed.days || typeof parsed.days !== "object") {
            return null;
        }

        const base = buildDefaultAccessSchedule();
        const keys = Object.keys(base) as WeekDayKey[];
        for (const key of keys) {
            const incoming = parsed.days[key];
            if (!incoming || typeof incoming !== "object") continue;

            base[key] = {
                enabled: Boolean(incoming.enabled),
                start: validTimeOrFallback(incoming.start, base[key].start),
                end: validTimeOrFallback(incoming.end, base[key].end),
            };
        }

        return base;
    } catch {
        return null;
    }
}

function parseLegacyCsvSchedule(source: UserAccessSource): AccessScheduleMap {
    const weekdayStart = validTimeOrFallback(source.horarioInicio, "08:00");
    const weekdayEnd = validTimeOrFallback(source.horarioFim, "18:00");
    const weekendStart = validTimeOrFallback(source.horarioInicioFds, weekdayStart);
    const weekendEnd = validTimeOrFallback(source.horarioFimFds, weekdayEnd);

    const schedule = buildDefaultAccessSchedule(weekdayStart, weekdayEnd);
    for (const day of WEEKEND_KEYS) {
        schedule[day].start = weekendStart;
        schedule[day].end = weekendEnd;
    }

    const allowed = typeof source.diasAcesso === "string" && source.diasAcesso.trim().length > 0
        ? source.diasAcesso.split(",").map((day) => day.trim()).filter((day) => day in schedule)
        : WEEKDAY_KEYS;

    const allowedSet = new Set(allowed);
    const keys = Object.keys(schedule) as WeekDayKey[];
    for (const key of keys) {
        schedule[key].enabled = allowedSet.has(key);
    }

    return schedule;
}

export function parseAccessSchedule(source: UserAccessSource): AccessScheduleMap {
    if (typeof source.diasAcesso === "string" && source.diasAcesso.trim().startsWith("{")) {
        const fromJson = tryParseJsonSchedule(source.diasAcesso);
        if (fromJson) return fromJson;
    }

    return parseLegacyCsvSchedule(source);
}

export function serializeAccessSchedule(schedule: AccessScheduleMap): string {
    return JSON.stringify({ version: 1, days: schedule });
}

export function deriveLegacyWindows(schedule: AccessScheduleMap): {
    horarioInicio: string;
    horarioFim: string;
    horarioInicioFds: string | null;
    horarioFimFds: string | null;
} {
    const firstWeekday = WEEKDAY_KEYS.find((day) => schedule[day].enabled) || "1";
    const weekdayWindow = schedule[firstWeekday];

    const firstWeekend = WEEKEND_KEYS.find((day) => schedule[day].enabled);
    const weekendWindow = firstWeekend ? schedule[firstWeekend] : null;

    return {
        horarioInicio: weekdayWindow.start,
        horarioFim: weekdayWindow.end,
        horarioInicioFds: weekendWindow ? weekendWindow.start : null,
        horarioFimFds: weekendWindow ? weekendWindow.end : null,
    };
}

export function getDayAccessWindow(schedule: AccessScheduleMap, day: number): DayAccessWindow {
    const key = String(day) as WeekDayKey;
    return schedule[key] || { enabled: false, start: "08:00", end: "18:00" };
}

export function isTimeRangeValid(start: string, end: string): boolean {
    if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) return false;
    return start < end;
}