import { prisma } from '../../../lib/prisma';
import { Commission, CommissionRepository } from '../domain/entities';

export class PrismaCommissionRepository implements CommissionRepository {
    async findAll(): Promise<Commission[]> {
        const commissions = await prisma.commission.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                loan: {
                    include: {
                        cliente: true,
                    }
                },
                vendedor: true,
            }
        });
        return commissions as unknown as Commission[];
    }

    async findById(id: string): Promise<Commission | null> {
        const commission = await prisma.commission.findUnique({
            where: { id },
            include: {
                loan: true,
                vendedor: true,
            }
        });
        return commission as unknown as Commission | null;
    }

    async findByLoanId(loanId: string): Promise<Commission | null> {
        const commission = await prisma.commission.findUnique({
            where: { loanId },
        });
        return commission as unknown as Commission | null;
    }

    async findBySellerId(vendedorId: string): Promise<Commission[]> {
        const commissions = await prisma.commission.findMany({
            where: { vendedorId },
            orderBy: { createdAt: 'desc' },
        });
        return commissions as unknown as Commission[];
    }

    async findByPeriod(mesAno: string): Promise<Commission[]> {
        const commissions = await prisma.commission.findMany({
            where: { mesAno },
            include: {
                loan: true,
                vendedor: true,
            }
        });
        return commissions as unknown as Commission[];
    }

    async create(data: Commission): Promise<Commission> {
        const commission = await prisma.commission.create({
            data: data as any,
        });
        return commission as unknown as Commission;
    }

    async update(id: string, data: Partial<Commission>): Promise<Commission> {
        const commission = await prisma.commission.update({
            where: { id },
            data: data as any,
        });
        return commission as unknown as Commission;
    }

    async delete(id: string): Promise<void> {
        await prisma.commission.delete({
            where: { id },
        });
    }
}
