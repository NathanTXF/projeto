import { z } from 'zod';

export const AppointmentSchema = z.object({
    id: z.string().optional(),
    data: z.date(),
    hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
    tipo: z.string().min(1, "Tipo é obrigatório"),
    observacao: z.string().optional().nullable(),
    criadorId: z.string(),
    destinatarioId: z.string().optional().nullable(),
    visibilidade: z.enum(["PRIVADO", "GLOBAL"]).default("PRIVADO"),
    status: z.enum(["PENDENTE", "CONCLUIDO", "CANCELADO"]).default("PENDENTE"),
    localizacao: z.string().optional().nullable(),
    createdAt: z.date().optional(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export interface AppointmentRepository {
    findById(id: string): Promise<Appointment | null>;
    findAllByDate(date: Date, userId?: string): Promise<Appointment[]>;
    findAllByMonth(month: number, year: number, userId?: string): Promise<Appointment[]>;
    findAllByUser(userId: string): Promise<Appointment[]>;
    create(data: Appointment): Promise<Appointment>;
    update(id: string, data: Partial<Appointment>): Promise<Appointment>;
    delete(id: string): Promise<void>;
}
