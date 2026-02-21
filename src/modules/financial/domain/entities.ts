import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['ENTRADA', 'SAIDA']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionCategorySchema = z.enum([
    'EMPRESTIMO',
    'COMISSAO',
    'DESPESA_FIXA',
    'DESPESA_VARIAVEL',
    'OUTROS'
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

export const TransactionSchema = z.object({
    id: z.string().uuid().optional(),
    data: z.date(),
    valor: z.number().positive(),
    tipo: TransactionTypeSchema,
    categoria: TransactionCategorySchema,
    descricao: z.string().min(3),
    referenciaId: z.string().optional(), // ID do empréstimo ou comissão
    pagoEm: z.date().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export interface FinancialRepository {
    findAll(): Promise<Transaction[]>;
    findById(id: string): Promise<Transaction | null>;
    findByPeriod(start: Date, end: Date): Promise<Transaction[]>;
    create(data: Transaction): Promise<Transaction>;
    update(id: string, data: Partial<Transaction>): Promise<Transaction>;
    delete(id: string): Promise<void>;
    getBalance(): Promise<{ totalEntradas: number; totalSaidas: number; saldo: number }>;
}
