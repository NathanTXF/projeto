let prisma;

function getRetentionMinutes() {
  const raw = process.env.RATE_LIMIT_RETENTION_MINUTES;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 60;
  }

  return parsed;
}

async function runCleanup() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }

  const retentionMinutes = getRetentionMinutes();
  const cutoff = new Date(Date.now() - retentionMinutes * 60 * 1000);

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

runCleanup()
  .catch((error) => {
    console.error('[rate-limit-cleanup] falha:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });