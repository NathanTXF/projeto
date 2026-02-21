import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = 'admin'; // Recomendado trocar no primeiro acesso
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { usuario: 'admin' },
        update: {},
        create: {
            nome: 'Administrador',
            usuario: 'admin',
            senha: hashedPassword,
            nivelAcesso: 1, // Admin/Gestor
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
