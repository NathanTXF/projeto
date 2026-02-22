import { z } from 'zod';
import { User } from '../../users/domain/entities';

export const FinancialStatusSchema = z.enum(['Em aberto', 'Pago']);
export type FinancialStatus = z.infer<typeof FinancialStatusSchema>;

export const FinancialSchema = z.object({
    id: z.string().uuid().optional(),
    commissionId: z.string().uuid(),
    vendedorId: z.string().uuid(),
    mesAno: z.string(),
    valorTotal: z.number().positive(),
    status: FinancialStatusSchema.default('Em aberto'),
    pagoEm: z.date().optional().nullable(),
    comprovanteUrl: z.string().optional().nullable(),
    createdAt: z.date().optional(),
});

export type FinancialTransaction = z.infer<typeof FinancialSchema>;

export interface FinancialRepository {
    findAll(): Promise<FinancialTransaction[]>;
    findById(id: string): Promise<FinancialTransaction | null>;
    findByPeriod(mesAno: string): Promise<FinancialTransaction[]>;
    findByVendedor(vendedorId: string): Promise<FinancialTransaction[]>;
    create(data: FinancialTransaction): Promise<FinancialTransaction>;
    update(id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction>;
}
