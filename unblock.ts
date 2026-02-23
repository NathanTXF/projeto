import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({
        where: { usuario: 'admin' },
        data: { failedAttempts: 0, lockUntil: null }
    });
    console.log('Admin user unblocked successfully');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
