import { prisma } from '../../../lib/prisma';
import { Customer, CustomerRepository } from '../domain/entities';

export class PrismaCustomerRepository implements CustomerRepository {
    async findAll(): Promise<Customer[]> {
        const customers = await prisma.customer.findMany({
            orderBy: { nome: 'asc' },
        });
        return customers as unknown as Customer[];
    }

    async findById(id: string): Promise<Customer | null> {
        const customer = await prisma.customer.findUnique({
            where: { id },
        });
        return customer as unknown as Customer | null;
    }

    async findByCpfCnpj(cpfCnpj: string): Promise<Customer | null> {
        const customer = await prisma.customer.findUnique({
            where: { cpfCnpj },
        });
        return customer as unknown as Customer | null;
    }

    async create(data: Customer): Promise<Customer> {
        const customer = await prisma.customer.create({
            data: data as any,
        });
        return customer as unknown as Customer;
    }

    async update(id: string, data: Partial<Customer>): Promise<Customer> {
        const customer = await prisma.customer.update({
            where: { id },
            data: data as any,
        });
        return customer as unknown as Customer;
    }

    async delete(id: string): Promise<void> {
        await prisma.customer.delete({
            where: { id },
        });
    }
}
