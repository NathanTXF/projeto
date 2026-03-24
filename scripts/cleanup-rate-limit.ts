import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRetentionMinutes(): number {
    const raw = process.env.RATE_LIMIT_RETENTION_MINUTES;
    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return 60;
    }

    return parsed;
}

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const retentionMinutes = getRetentionMinutes();
    const cutoff = new Date(Date.now() - retentionMinutes * 60 * 1000);

    const candidates = await prisma.rateLimitBucket.count({
        where: {
            resetAt: {
                lt: cutoff,
            },
        },
    });

    if (dryRun) {
        console.log('[rate-limit-cleanup] dry-run habilitado');
        console.log(`[rate-limit-cleanup] candidatos para exclusao: ${candidates}`);
        console.log(`[rate-limit-cleanup] limite de retencao: ${retentionMinutes} minuto(s)`);
        return;
    }

    const result = await prisma.rateLimitBucket.deleteMany({
        where: {
            resetAt: {
                lt: cutoff,
            },
        },
    });

    console.log(`[rate-limit-cleanup] buckets removidos: ${result.count}`);
    console.log(`[rate-limit-cleanup] limite de retencao: ${retentionMinutes} minuto(s)`);
}

main()
    .catch((error) => {
        console.error('[rate-limit-cleanup] falha:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });