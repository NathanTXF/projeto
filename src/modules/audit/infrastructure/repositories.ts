import { Audit, AuditRepository } from '../domain/entities';
import { prisma } from '@/lib/prisma';

export class PrismaAuditRepository implements AuditRepository {
    async findAll(filters?: {
        usuarioId?: string;
        modulo?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Audit[]> {
        const where: any = {};

        if (filters?.usuarioId) {
            where.usuarioId = filters.usuarioId;
        }

        if (filters?.modulo) {
            where.modulo = filters.modulo;
        }

        if (filters?.startDate || filters?.endDate) {
            where.timestamp = {};
            if (filters.startDate) where.timestamp.gte = filters.startDate;
            if (filters.endDate) where.timestamp.lte = filters.endDate;
        }

        return await prisma.audit.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            include: {
                usuario: {
                    select: { nome: true }
                }
            }
        }) as any;
    }

    async findById(id: string): Promise<Audit | null> {
        return await prisma.audit.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: { nome: true }
                }
            }
        }) as any;
    }
}
