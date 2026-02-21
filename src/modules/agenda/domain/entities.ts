import { z } from 'zod';

export const AppointmentSchema = z.object({
    id: z.string().optional(),
    data: z.date(),
    hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
    tipo: z.string().min(1, "Tipo é obrigatório"),
    observacao: z.string().optional().nullable(),
    criadorId: z.string(),
    createdAt: z.date().optional(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export interface AppointmentRepository {
    findById(id: string): Promise<Appointment | null>;
    findAllByDate(date: Date): Promise<Appointment[]>;
    findAllByUser(userId: string): Promise<Appointment[]>;
    create(data: Appointment): Promise<Appointment>;
    update(id: string, data: Partial<Appointment>): Promise<Appointment>;
    delete(id: string): Promise<void>;
}
