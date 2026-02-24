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
                loan: {
                    include: { cliente: true }
                },
                vendedor: true,
            }
        });
        return commissions as unknown as Commission[];
    }

    async findByFilters(filters: { mesAno?: string; vendedorId?: string }): Promise<Commission[]> {
        const commissions = await prisma.commission.findMany({
            where: {
                mesAno: filters.mesAno,
                vendedorId: filters.vendedorId,
            },
            include: {
                loan: {
                    include: { cliente: true }
                },
                vendedor: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return commissions as unknown as Commission[];
    }

    async findPendingLoans(filters: { mesAno?: string; vendedorId?: string }): Promise<any[]> {
        const where: any = {
            vendedorId: filters.vendedorId,
            commission: null, // Loans that don't have a commission record yet
        };

        if (filters.mesAno) {
            const [month, year] = filters.mesAno.split('/').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            where.dataInicio = {
                gte: startDate,
                lte: endDate,
            };
        }

        const loans = await prisma.loan.findMany({
            where,
            include: {
                cliente: true,
                vendedor: true,
            },
            orderBy: { dataInicio: 'desc' },
        });

        // Map loans to a structure that the frontend can easily handle next to commissions
        return loans.map(loan => ({
            id: `pending-${loan.id}`,
            loanId: loan.id,
            vendedorId: loan.vendedorId,
            mesAno: filters.mesAno || new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(loan.dataInicio),
            status: 'PENDENTE_GERACAO',
            valorCalculado: 0,
            tipoComissao: 'PORCENTAGEM',
            valorReferencia: 0,
            loan: {
                id: loan.id,
                cod: loan.cod,
                cliente: loan.cliente,
                valorLiquido: Number(loan.valorLiquido),
            },
            vendedor: loan.vendedor,
        }));
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
