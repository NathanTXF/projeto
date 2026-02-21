import { z } from 'zod';

export const CustomerSchema = z.object({
    id: z.string().uuid().optional(),
    cod: z.number().optional(),
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
    email: z.string().email('E-mail inválido'),
    celular: z.string().min(10, 'Celular inválido'),
    endereco: z.string().min(5, 'Endereço muito curto'),
    cidade: z.string().min(2, 'Cidade inválida'),
    bairro: z.string().min(2, 'Bairro inválido'),
    estado: z.string().length(2, 'UF inválida'),
    dataNascimento: z.date({ message: "Data de nascimento é obrigatória" }),
    sexo: z.enum(['feminino', 'masculino'], { message: "Sexo é obrigatório" }),
    matricula: z.string().optional(),
    senha: z.string().optional(),
    observacao: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const calculateAge = (birthDate: Date | string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export interface CustomerRepository {
    findAll(): Promise<Customer[]>;
    findById(id: string): Promise<Customer | null>;
    findByCpfCnpj(cpfCnpj: string): Promise<Customer | null>;
    create(customer: Customer): Promise<Customer>;
    update(id: string, customer: Partial<Customer>): Promise<Customer>;
    delete(id: string): Promise<void>;
}
