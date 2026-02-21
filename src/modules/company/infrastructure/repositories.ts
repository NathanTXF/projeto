import { prisma } from '@/lib/prisma';
import { Company, CompanyRepository } from '../domain/entities';

export class PrismaCompanyRepository implements CompanyRepository {
    async get(): Promise<Company | null> {
        return await prisma.company.findFirst() as any;
    }

    async update(data: Partial<Company>): Promise<Company> {
        const existing = await prisma.company.findFirst();

        if (!existing) {
            return await prisma.company.create({
                data: data as any
            }) as any;
        }

        return await prisma.company.update({
            where: { id: existing.id },
            data: data as any
        }) as any;
    }
}
