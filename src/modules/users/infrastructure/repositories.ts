import { User, UserRepository } from '../domain/entities';
import { prisma } from '@/lib/prisma';

export class PrismaUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        return user as any;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { usuario: username }
        });
        return user as any;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: {
                nome: data.nome,
                usuario: data.usuario,
                senha: data.senha,
                fotoUrl: data.fotoUrl,
                horarioInicio: data.horarioInicio,
                horarioFim: data.horarioFim,
            }
        });
        return user as any;
    }
}
