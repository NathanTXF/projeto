import { prisma } from '@/lib/prisma';

type ConsumeInput = {
    key: string;
    limit: number;
    windowMs: number;
};

type ConsumeResult = {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
    resetAt: number;
};

export async function consumeRateLimit(input: ConsumeInput): Promise<ConsumeResult> {
    const now = Date.now();
    const resetAt = new Date(now + input.windowMs);

    const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
        INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "createdAt", "updatedAt")
        VALUES (${input.key}, 1, ${resetAt}, NOW(), NOW())
        ON CONFLICT ("key")
        DO UPDATE SET
            "count" = CASE
                WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
                ELSE "RateLimitBucket"."count" + 1
            END,
            "resetAt" = CASE
                WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
                ELSE "RateLimitBucket"."resetAt"
            END,
            "updatedAt" = NOW()
        RETURNING "count", "resetAt";
    `;

    const row = rows[0];
    const bucketCount = row?.count ?? 1;
    const bucketResetAt = row?.resetAt?.getTime() ?? resetAt.getTime();
    const remaining = Math.max(input.limit - bucketCount, 0);
    const retryAfterSeconds = Math.max(Math.ceil((bucketResetAt - now) / 1000), 1);

    return {
        allowed: bucketCount <= input.limit,
        limit: input.limit,
        remaining,
        retryAfterSeconds,
        resetAt: bucketResetAt,
    };
}

export function rateLimitHeaders(result: ConsumeResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    };
}
