import { z } from 'zod';

export const CompanySchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(1, "Nome é obrigatório"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    contato: z.string().min(1, "Contato é obrigatório"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    logoUrl: z.string().optional().nullable(),
});

export type Company = z.infer<typeof CompanySchema>;

export interface CompanyRepository {
    get(): Promise<Company | null>;
    update(data: Partial<Company>): Promise<Company>;
}
