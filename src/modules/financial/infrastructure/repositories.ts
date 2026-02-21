import { prisma } from '../../../lib/prisma';
import { Transaction, FinancialRepository } from '../domain/entities';

export class PrismaFinancialRepository implements FinancialRepository {
    async findAll(): Promise<Transaction[]> {
        const transactions = await prisma.transaction.findMany({
            orderBy: { data: 'desc' },
        });
        return transactions as unknown as Transaction[];
    }

    async findById(id: string): Promise<Transaction | null> {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
        });
        return transaction as unknown as Transaction | null;
    }

    async findByPeriod(start: Date, end: Date): Promise<Transaction[]> {
        const transactions = await prisma.transaction.findMany({
            where: {
                data: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { data: 'asc' },
        });
        return transactions as unknown as Transaction[];
    }

    async create(data: Transaction): Promise<Transaction> {
        const transaction = await prisma.transaction.create({
            data: data as any,
        });
        return transaction as unknown as Transaction;
    }

    async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const transaction = await prisma.transaction.update({
            where: { id },
            data: data as any,
        });
        return transaction as unknown as Transaction;
    }

    async delete(id: string): Promise<void> {
        await prisma.transaction.delete({
            where: { id },
        });
    }

    async getBalance(): Promise<{ totalEntradas: number; totalSaidas: number; saldo: number }> {
        const aggregates = await prisma.transaction.groupBy({
            by: ['tipo'],
            _sum: {
                valor: true,
            },
        });

        let totalEntradas = 0;
        let totalSaidas = 0;

        aggregates.forEach((group) => {
            if (group.tipo === 'ENTRADA') totalEntradas = Number(group._sum.valor || 0);
            if (group.tipo === 'SAIDA') totalSaidas = Number(group._sum.valor || 0);
        });

        return {
            totalEntradas,
            totalSaidas,
            saldo: totalEntradas - totalSaidas,
        };
    }
}
