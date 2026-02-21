import { z } from 'zod';

export const CustomerSchema = z.object({
    id: z.string().uuid().optional(),
    cod: z.number().optional(),
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
    email: z.string().email('E-mail inválido'),
    celular: z.string().min(10, 'Celular inválido'),
    endereco: z.string().min(5, 'Endereço obrigatório'),
    cidade: z.string().min(2, 'Cidade obrigatória'),
    bairro: z.string().min(2, 'Bairro obrigatório'),
    estado: z.string().length(2, 'UF deve ter 2 caracteres'),
    dataNascimento: z.date(),
    sexo: z.enum(['feminino', 'masculino']),
    matricula: z.string().min(1, 'Matrícula obrigatória'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
    observacao: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export interface CustomerRepository {
    findAll(): Promise<Customer[]>;
    findById(id: string): Promise<Customer | null>;
    findByCpfCnpj(cpfCnpj: string): Promise<Customer | null>;
    create(data: Customer): Promise<Customer>;
    update(id: string, data: Partial<Customer>): Promise<Customer>;
    delete(id: string): Promise<void>;
}
