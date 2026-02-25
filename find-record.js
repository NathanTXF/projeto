const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const record = await prisma.financial.findFirst({
        where: { status: 'EM_ABERTO' }
    });
    if (record) {
        console.log(`FOUND_ID: ${record.id}`);
    } else {
        console.log('NOT_FOUND');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
