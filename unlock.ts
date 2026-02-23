import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({
        data: {
            failedAttempts: 0,
            lockUntil: null
        }
    });
    console.log('Todos os usuários desbloqueados.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
