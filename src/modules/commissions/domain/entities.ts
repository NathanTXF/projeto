import { z } from 'zod';

export const CommissionStatusSchema = z.enum(['EM_ABERTO', 'APROVADO', 'CANCELADO']);
export type CommissionStatus = z.infer<typeof CommissionStatusSchema>;

export const CommissionTypeSchema = z.enum(['PORCENTAGEM', 'VALOR_FIXO']);
export type CommissionType = z.infer<typeof CommissionTypeSchema>;

export const CommissionSchema = z.object({
    id: z.string().uuid().optional(),
    loanId: z.string().uuid(),
    vendedorId: z.string().uuid(),
    mesAno: z.string().regex(/^\d{2}\/\d{4}$/, 'Formato deve ser MM/YYYY'),
    tipoComissao: CommissionTypeSchema,
    valorReferencia: z.number().positive(),
    valorCalculado: z.number(),
    status: CommissionStatusSchema.default('EM_ABERTO'),
    aprovadoEm: z.date().optional(),
    createdAt: z.date().optional(),
});

export type Commission = z.infer<typeof CommissionSchema>;

export interface CommissionRepository {
    findAll(): Promise<Commission[]>;
    findById(id: string): Promise<Commission | null>;
    findByLoanId(loanId: string): Promise<Commission | null>;
    findBySellerId(vendedorId: string): Promise<Commission[]>;
    findByPeriod(mesAno: string): Promise<Commission[]>;
    findByFilters(filters: { mesAno?: string; vendedorId?: string }): Promise<Commission[]>;
    findPendingLoans(filters: { mesAno?: string; vendedorId?: string }): Promise<any[]>;
    create(data: Commission): Promise<Commission>;
    update(id: string, data: Partial<Commission>): Promise<Commission>;
    delete(id: string): Promise<void>;
}
