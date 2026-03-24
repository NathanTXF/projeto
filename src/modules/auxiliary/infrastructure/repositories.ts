import { prisma } from '../../../lib/prisma';
import { AuxiliaryListOptions, AuxiliaryPaginatedResult, AuxiliaryRepository } from '../domain/entities';

type AuxiliaryModel<T> = {
    findMany(args: Record<string, unknown>): Promise<T[]>;
    findUnique(args: Record<string, unknown>): Promise<T | null>;
    create(args: Record<string, unknown>): Promise<T>;
    update(args: Record<string, unknown>): Promise<T>;
    delete(args: Record<string, unknown>): Promise<unknown>;
    count(args: Record<string, unknown>): Promise<number>;
};

export class PrismaAuxiliaryRepository<T extends { id: number; nome: string }> implements AuxiliaryRepository<T> {
    constructor(private modelName: keyof typeof prisma) { }

    private getModel(): AuxiliaryModel<T> {
        return prisma[this.modelName] as unknown as AuxiliaryModel<T>;
    }

    async findAll(): Promise<T[]> {
        const model = this.getModel();
        return await model.findMany({
            orderBy: { nome: 'asc' },
        });
    }

    async findPaginated(options: AuxiliaryListOptions): Promise<AuxiliaryPaginatedResult<T>> {
        const model = this.getModel();
        const page = Math.max(1, options.page ?? 1);
        const pageSize = Math.max(1, Math.min(100, options.pageSize ?? 12));
        const query = options.query?.trim();
        const sort = options.sort ?? 'alphabetic';

        const where = query
            ? {
                OR: [
                    { nome: { contains: query, mode: 'insensitive' } },
                    { id: Number.isFinite(Number(query)) ? Number(query) : -1 },
                ],
            }
            : undefined;

        const total = await model.count({ where });
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const normalizedPage = Math.min(page, totalPages);
        const items = await model.findMany({
            where,
            orderBy: sort === 'newest' ? { id: 'desc' } : { nome: 'asc' },
            skip: (normalizedPage - 1) * pageSize,
            take: pageSize,
        });

        return {
            items,
            total,
            page: normalizedPage,
            pageSize,
            totalPages,
        };
    }

    async findById(id: number): Promise<T | null> {
        const model = this.getModel();
        return await model.findUnique({
            where: { id },
        });
    }

    async create(data: Omit<T, 'id'>): Promise<T> {
        const model = this.getModel();
        return await model.create({
            data,
        });
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const model = this.getModel();
        return await model.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<void> {
        const model = this.getModel();
        await model.delete({
            where: { id },
        });
    }
}
