import { prisma } from '@/lib/prisma';
import { Appointment, AppointmentRepository } from '../domain/entities';
import { Prisma } from '@prisma/client';

export class PrismaAppointmentRepository implements AppointmentRepository {
    async findById(id: string): Promise<Appointment | null> {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { criador: true, destinatario: true }
        });
        return appointment as unknown as Appointment | null;
    }

    async findAllByDate(date: Date, userId?: string): Promise<Appointment[]> {
        // Obter início e fim do dia
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const where: Prisma.AppointmentWhereInput = {
            data: {
                gte: start,
                lte: end
            }
        };

        // Regra de Visibilidade: Criador OR Destinatário OR GLOBAL
        if (userId) {
            where.OR = [
                { criadorId: userId },
                { destinatarioId: userId },
                { visibilidade: "GLOBAL" }
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where,
            orderBy: { hora: 'asc' },
            include: { criador: true, destinatario: true }
        });
        return appointments as unknown as Appointment[];
    }

    async findAllByMonth(month: number, year: number, userId?: string): Promise<Appointment[]> {
        // Obter início e fim do mês
        const start = new Date(year, month - 1, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(year, month, 0);
        end.setHours(23, 59, 59, 999);

        const where: Prisma.AppointmentWhereInput = {
            data: {
                gte: start,
                lte: end
            }
        };

        if (userId) {
            where.OR = [
                { criadorId: userId },
                { destinatarioId: userId },
                { visibilidade: "GLOBAL" }
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where,
            orderBy: [{ data: 'asc' }, { hora: 'asc' }],
            include: { criador: true, destinatario: true }
        });
        return appointments as unknown as Appointment[];
    }

    async findAllByUser(userId: string): Promise<Appointment[]> {
        const appointments = await prisma.appointment.findMany({
            where: { criadorId: userId },
            orderBy: { data: 'desc' },
            include: { criador: true }
        });
        return appointments as unknown as Appointment[];
    }

    async create(data: Appointment): Promise<Appointment> {
        const appointment = await prisma.appointment.create({
            data: {
                data: data.data,
                hora: data.hora,
                tipo: data.tipo,
                observacao: data.observacao,
                criadorId: data.criadorId,
                destinatarioId: data.destinatarioId,
                visibilidade: data.visibilidade || "PRIVADO",
                status: data.status || "PENDENTE"
            }
        });
        return appointment as unknown as Appointment;
    }

    async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                data: data.data,
                hora: data.hora,
                tipo: data.tipo,
                observacao: data.observacao,
                destinatarioId: data.destinatarioId,
                visibilidade: data.visibilidade,
                status: data.status
            }
        });
        return appointment as unknown as Appointment;
    }

    async delete(id: string): Promise<void> {
        await prisma.appointment.delete({
            where: { id }
        });
    }
}
