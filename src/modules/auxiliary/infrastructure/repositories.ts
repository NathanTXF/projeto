import { prisma } from '../../../lib/prisma';
import { AuxiliaryRepository } from '../domain/entities';

export class PrismaAuxiliaryRepository<T extends { id: number; nome: string }> implements AuxiliaryRepository<T> {
    constructor(private modelName: keyof typeof prisma) { }

    async findAll(): Promise<T[]> {
        const model = prisma[this.modelName] as any;
        return await model.findMany({
            orderBy: { nome: 'asc' },
        });
    }

    async findById(id: number): Promise<T | null> {
        const model = prisma[this.modelName] as any;
        return await model.findUnique({
            where: { id },
        });
    }

    async create(data: Omit<T, 'id'>): Promise<T> {
        const model = prisma[this.modelName] as any;
        return await model.create({
            data,
        });
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const model = prisma[this.modelName] as any;
        return await model.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<void> {
        const model = prisma[this.modelName] as any;
        await model.delete({
            where: { id },
        });
    }
}
