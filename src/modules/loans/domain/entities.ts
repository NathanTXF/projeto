import { z } from 'zod';

export const LoanStatusSchema = z.enum(['ATIVO', 'FINALIZADO', 'CANCELADO', 'ATRASADO']);
export type LoanStatus = z.infer<typeof LoanStatusSchema>;

export const LoanSchema = z.object({
    id: z.string().uuid().optional(),
    cod: z.number().optional(),
    dataInicio: z.date(),
    prazo: z.number({ message: "Informe o prazo" }).int('Prazo deve ser um número inteiro').positive('Prazo deve ser positivo'),
    valorParcela: z.number({ message: "Informe o valor" }).positive('Valor da parcela deve ser maior que zero'),
    valorBruto: z.number({ message: "Informe o valor" }).positive('Valor bruto deve ser maior que zero'),
    valorLiquido: z.number({ message: "Informe o valor" }).positive('Valor líquido deve ser maior que zero'),
    status: LoanStatusSchema,
    observacao: z.string().optional(),

    // Relacionamentos (IDs)
    clienteId: z.string({ message: "Selecione um cliente" }).uuid('Selecione um cliente'),
    vendedorId: z.string().uuid('Vendedor inválido').optional(),
    orgaoId: z.number({ message: "Selecione o órgão" }).int('Selecione o órgão'),
    bancoId: z.number({ message: "Selecione o banco" }).int('Selecione o banco'),
    tipoId: z.number({ message: "Selecione o tipo" }).int('Selecione o tipo'),
    grupoId: z.number({ message: "Selecione o grupo" }).int('Selecione o grupo'),
    tabelaId: z.number({ message: "Selecione a tabela" }).int('Selecione a tabela'),

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
