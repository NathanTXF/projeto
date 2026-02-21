import { z } from 'zod';

export const AuditSchema = z.object({
    id: z.string().uuid().optional(),
    data: z.date().optional(),
    usuarioId: z.string().uuid(),
    modulo: z.string(),
    acao: z.string(),
    entidadeId: z.string().optional(),
    ip: z.string().optional(),
});

export type Audit = z.infer<typeof AuditSchema>;

export interface AuditRepository {
    findAll(filters?: {
        usuarioId?: string;
        modulo?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Audit[]>;
    findById(id: string): Promise<Audit | null>;
}
