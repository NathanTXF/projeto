import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid().optional(),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    usuario: z.string().min(3, 'Usuário deve ter no mínimo 3 caracteres'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    fotoUrl: z.string().url().optional().nullable(),
    nivelAcesso: z.number().int(),
    horarioInicio: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional().nullable(),
    horarioFim: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional().nullable(),
    failedAttempts: z.number().int().optional(),
    lockUntil: z.date().optional().nullable(),
    contato: z.string().optional().nullable(),
    endereco: z.string().optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(data: User): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
}
