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
                nivelAcesso: data.nivelAcesso ?? undefined,
                horarioInicio: data.horarioInicio,
                horarioFim: data.horarioFim,
                failedAttempts: data.failedAttempts,
                lockUntil: data.lockUntil,
                contato: data.contato,
                endereco: data.endereco,
                roleId: data.roleId,
                ativo: data.ativo,
                diasAcesso: data.diasAcesso,
                horarioInicioFds: data.horarioInicioFds,
                horarioFimFds: data.horarioFimFds,
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
        // Safe deletion check: verify if the user has associated loans, commissions, or financials
        const userWithRelations = await prisma.user.findUnique({
            where: { id },
            include: {
                loans: true,
                commissions: true,
                financials: true,
                customers: true,
                goals: true,
                audits: true,
            }
        });

        if (!userWithRelations) {
            throw new Error(`Usuário não encontrado com ID: ${id}`);
        }

        if (
            (userWithRelations.loans && userWithRelations.loans.length > 0) ||
            (userWithRelations.commissions && userWithRelations.commissions.length > 0) ||
            (userWithRelations.financials && userWithRelations.financials.length > 0) ||
            (userWithRelations.customers && userWithRelations.customers.length > 0) ||
            (userWithRelations.goals && userWithRelations.goals.length > 0) ||
            (userWithRelations.audits && userWithRelations.audits.length > 0)
        ) {
            throw new Error('Este usuário não pode ser excluído pois possui histórico de vendas, clientes, auditoria ou metas no sistema. No entanto, você pode desativar o acesso mudando o status para "Inativo".');
        }

        await prisma.user.delete({
            where: { id }
        });
    }
}
