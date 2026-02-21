import { prisma } from '../../../lib/prisma';
import { Loan, LoanRepository } from '../domain/entities';

export class PrismaLoanRepository implements LoanRepository {
    async findAll(): Promise<Loan[]> {
        const loans = await prisma.loan.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                cliente: true,
                vendedor: true,
                orgao: true,
                banco: true,
                tipo: true,
                grupo: true,
                tabela: true,
            }
        });
        return loans as unknown as Loan[];
    }

    async findById(id: string): Promise<Loan | null> {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                cliente: true,
                vendedor: true,
                orgao: true,
                banco: true,
                tipo: true,
                grupo: true,
                tabela: true,
            }
        });
        return loan as unknown as Loan | null;
    }

    async findByCustomerId(clienteId: string): Promise<Loan[]> {
        const loans = await prisma.loan.findMany({
            where: { clienteId },
            include: {
                vendedor: true,
                banco: true,
                tipo: true,
            }
        });
        return loans as unknown as Loan[];
    }

    async findBySellerId(vendedorId: string): Promise<Loan[]> {
        const loans = await prisma.loan.findMany({
            where: { vendedorId },
            include: {
                cliente: true,
                banco: true,
            }
        });
        return loans as unknown as Loan[];
    }

    async create(data: Loan): Promise<Loan> {
        const loan = await prisma.loan.create({
            data: data as any,
        });
        return loan as unknown as Loan;
    }

    async update(id: string, data: Partial<Loan>): Promise<Loan> {
        const loan = await prisma.loan.update({
            where: { id },
            data: data as any,
        });
        return loan as unknown as Loan;
    }

    async delete(id: string): Promise<void> {
        await prisma.loan.delete({
            where: { id },
        });
    }
}
