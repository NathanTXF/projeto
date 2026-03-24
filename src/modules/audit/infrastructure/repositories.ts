import { Audit, AuditRepository } from '../domain/entities';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class PrismaAuditRepository implements AuditRepository {
    async findAll(filters?: {
        usuarioId?: string;
        usuarioNome?: string;
        modulo?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Audit[]> {
        const where: Prisma.AuditWhereInput = {};

        if (filters?.usuarioId) {
            where.usuarioId = filters.usuarioId;
        }

        if (filters?.usuarioNome) {
            where.usuario = {
                nome: {
                    contains: filters.usuarioNome,
                    mode: 'insensitive'
                }
            };
        }

        if (filters?.modulo) {
            where.modulo = filters.modulo;
        }

        if (filters?.startDate || filters?.endDate) {
            where.timestamp = {};
            if (filters.startDate) where.timestamp.gte = filters.startDate;
            if (filters.endDate) where.timestamp.lte = filters.endDate;
        }

        const rows = await prisma.audit.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            include: {
                usuario: {
                    select: { nome: true }
                }
            }
        });

        return rows.map((row) => ({
            id: row.id,
            timestamp: row.timestamp,
            usuarioId: row.usuarioId,
            modulo: row.modulo,
            acao: row.acao,
            entidadeId: row.entidadeId ?? undefined,
            ip: row.ip ?? undefined,
        }));
    }

    async findById(id: string): Promise<Audit | null> {
        const row = await prisma.audit.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: { nome: true }
                }
            }
        });

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            timestamp: row.timestamp,
            usuarioId: row.usuarioId,
            modulo: row.modulo,
            acao: row.acao,
            entidadeId: row.entidadeId ?? undefined,
            ip: row.ip ?? undefined,
        };
    }
}
