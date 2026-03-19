import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await prisma.user.updateMany({
        where: { usuario: 'admin' },
        data: {
            senha: hashedPassword,
            failedAttempts: 0,
            lockUntil: null
        }
    });
    console.log('Senha do admin redefinida para "admin".');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
