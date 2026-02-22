import { prisma } from '../../../lib/prisma';
import { FinancialTransaction, FinancialRepository, FinancialStatus } from '../domain/entities';

export class PrismaFinancialRepository implements FinancialRepository {
    async findAll(): Promise<FinancialTransaction[]> {
        const records = await prisma.financial.findMany({
            orderBy: { createdAt: 'desc' },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return records.map(this.mapToFinancialTransaction);
    }

    async findById(id: string): Promise<FinancialTransaction | null> {
        const record = await prisma.financial.findUnique({
            where: { id },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return record ? this.mapToFinancialTransaction(record) : null;
    }

    async findByPeriod(mesAno: string): Promise<FinancialTransaction[]> {
        const records = await prisma.financial.findMany({
            where: { mesAno },
            orderBy: { createdAt: 'desc' },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return records.map(this.mapToFinancialTransaction);
    }

    async findByVendedor(vendedorId: string): Promise<FinancialTransaction[]> {
        const records = await prisma.financial.findMany({
            where: { vendedorId },
            orderBy: { createdAt: 'desc' },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return records.map(this.mapToFinancialTransaction);
    }

    async create(data: FinancialTransaction): Promise<FinancialTransaction> {
        const record = await prisma.financial.create({
            data: {
                commissionId: data.commissionId,
                vendedorId: data.vendedorId,
                mesAno: data.mesAno,
                valorTotal: data.valorTotal,
                status: data.status,
                pagoEm: data.pagoEm,
                comprovanteUrl: data.comprovanteUrl,
            },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return this.mapToFinancialTransaction(record);
    }

    async update(id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
        const record = await prisma.financial.update({
            where: { id },
            data: {
                status: data.status,
                pagoEm: data.pagoEm,
                comprovanteUrl: data.comprovanteUrl,
            },
            include: { commission: { include: { loan: true } }, vendedor: true },
        });
        return this.mapToFinancialTransaction(record);
    }

    private mapToFinancialTransaction(record: any): FinancialTransaction {
        return {
            id: record.id,
            commissionId: record.commissionId,
            vendedorId: record.vendedorId,
            mesAno: record.mesAno,
            valorTotal: Number(record.valorTotal),
            status: record.status as FinancialStatus,
            pagoEm: record.pagoEm,
            comprovanteUrl: record.comprovanteUrl,
            createdAt: record.createdAt,
            // Add extra nested fields for easier UI consumption if needed, like:
            vendedorNome: record.vendedor?.nome,
            vendedorFoto: record.vendedor?.fotoUrl,
            clienteNome: record.commission?.loan?.cliente?.nome,
        } as unknown as FinancialTransaction;
    }
}
