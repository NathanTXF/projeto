import { z } from 'zod';

export const LoanStatusSchema = z.enum(['ATIVO', 'FINALIZADO', 'CANCELADO', 'ATRASADO']);
export type LoanStatus = z.infer<typeof LoanStatusSchema>;

export const LoanSchema = z.object({
    id: z.string().uuid().optional(),
    cod: z.number().optional(),
    dataInicio: z.date(),
    prazo: z.number().int().positive('Prazo deve ser positivo'),
    valorParcela: z.number().positive('Valor da parcela deve ser maior que zero'),
    valorBruto: z.number().positive('Valor bruto deve ser maior que zero'),
    valorLiquido: z.number().positive('Valor líquido deve ser maior que zero'),
    status: LoanStatusSchema,
    observacao: z.string().optional(),

    // Relacionamentos (IDs)
    clienteId: z.string().uuid('Cliente inválido'),
    vendedorId: z.string().uuid('Vendedor inválido'),
    orgaoId: z.number().int('Órgão inválido'),
    bancoId: z.number().int('Banco inválido'),
    tipoId: z.number().int('Tipo inválido'),
    grupoId: z.number().int('Grupo inválido'),
    tabelaId: z.number().int('Tabela inválida'),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Loan = z.infer<typeof LoanSchema>;

export interface LoanRepository {
    findAll(): Promise<Loan[]>;
    findById(id: string): Promise<Loan | null>;
    findByCustomerId(customerId: string): Promise<Loan[]>;
    findBySellerId(sellerId: string): Promise<Loan[]>;
    create(data: Loan): Promise<Loan>;
    update(id: string, data: Partial<Loan>): Promise<Loan>;
    delete(id: string): Promise<void>;
}
