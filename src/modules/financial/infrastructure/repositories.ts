import { prisma } from '../../../lib/prisma';
import { Transaction, FinancialRepository } from '../domain/entities';

export class PrismaFinancialRepository implements FinancialRepository {
    async findAll(): Promise<Transaction[]> {
        const records = await prisma.financial.findMany({
            orderBy: { createdAt: 'desc' },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return records.map(this.mapToTransaction);
    }

    async findById(id: string): Promise<Transaction | null> {
        const record = await prisma.financial.findUnique({
            where: { id },
            include: { commission: true, vendedor: true },
        });
        return record ? this.mapToTransaction(record) : null;
    }

    async findByPeriod(start: Date, end: Date): Promise<Transaction[]> {
        const records = await prisma.financial.findMany({
            where: {
                createdAt: { gte: start, lte: end },
            },
            orderBy: { createdAt: 'asc' },
            include: { commission: true, vendedor: true },
        });
        return records.map(this.mapToTransaction);
    }

    async create(data: Transaction): Promise<Transaction> {
        const record = await prisma.financial.create({
            data: {
                commissionId: (data as any).commissionId,
                vendedorId: (data as any).vendedorId,
                mesAno: (data as any).mesAno || new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
                valorTotal: (data as any).valor || (data as any).valorTotal || 0,
                status: (data as any).status || 'Em aberto',
            },
            include: { commission: true, vendedor: true },
        });
        return this.mapToTransaction(record);
    }

    async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const record = await prisma.financial.update({
            where: { id },
            data: {
                status: (data as any).status,
                pagoEm: (data as any).pagoEm,
                comprovanteUrl: (data as any).comprovanteUrl,
            },
            include: { commission: true, vendedor: true },
        });
        return this.mapToTransaction(record);
    }

    async delete(id: string): Promise<void> {
        await prisma.financial.delete({ where: { id } });
    }

    async getBalance(): Promise<{ totalEntradas: number; totalSaidas: number; saldo: number }> {
        const total = await prisma.financial.aggregate({
            _sum: { valorTotal: true },
        });

        const paid = await prisma.financial.aggregate({
            _sum: { valorTotal: true },
            where: { status: 'Pago' },
        });

        const totalEntradas = Number(paid._sum?.valorTotal || 0);
        const totalSaidas = 0;

        return {
            totalEntradas,
            totalSaidas,
            saldo: totalEntradas - totalSaidas,
        };
    }

    private mapToTransaction(record: any): Transaction {
        return {
            id: record.id,
            tipo: 'ENTRADA',
            categoria: 'COMISSAO',
            descricao: `Comissão ${record.mesAno || ''}`,
            valor: Number(record.valorTotal),
            data: record.createdAt,
            status: record.status,
            vendedorId: record.vendedorId,
            vendedorNome: record.vendedor?.nome,
        } as unknown as Transaction;
    }
}
