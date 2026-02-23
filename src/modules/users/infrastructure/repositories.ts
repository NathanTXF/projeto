import { User, UserRepository } from '../domain/entities';
import { prisma } from '@/lib/prisma';

export class PrismaUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });
        return user as any;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { usuario: username },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });
        return user as any;
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({
            orderBy: { nome: 'asc' },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });
        return users as any;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: {
                nome: data.nome,
                usuario: data.usuario,
                senha: data.senha,
                fotoUrl: data.fotoUrl,
                nivelAcesso: data.nivelAcesso,
                horarioInicio: data.horarioInicio,
                horarioFim: data.horarioFim,
                failedAttempts: data.failedAttempts,
                lockUntil: data.lockUntil,
                contato: data.contato,
                endereco: data.endereco,
            }
        });
        return user as any;
    }

    async create(data: User): Promise<User> {
        const user = await prisma.user.create({
            data: data as any
        });
        return user as any;
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }
}
