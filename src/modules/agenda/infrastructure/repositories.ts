import { prisma } from '@/core/infra/prisma';
import { Appointment, AppointmentRepository } from '../domain/entities';

export class PrismaAppointmentRepository implements AppointmentRepository {
    async findById(id: string): Promise<Appointment | null> {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { criador: true }
        });
        return appointment as any;
    }

    async findAllByDate(date: Date): Promise<Appointment[]> {
        // Obter início e fim do dia
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                data: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { hora: 'asc' },
            include: { criador: true }
        });
        return appointments as any;
    }

    async findAllByUser(userId: string): Promise<Appointment[]> {
        const appointments = await prisma.appointment.findMany({
            where: { criadorId: userId },
            orderBy: { data: 'desc' },
            include: { criador: true }
        });
        return appointments as any;
    }

    async create(data: Appointment): Promise<Appointment> {
        const appointment = await prisma.appointment.create({
            data: {
                data: data.data,
                hora: data.hora,
                tipo: data.tipo,
                observacao: data.observacao,
                criadorId: data.criadorId
            }
        });
        return appointment as any;
    }

    async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                data: data.data,
                hora: data.hora,
                tipo: data.tipo,
                observacao: data.observacao
            }
        });
        return appointment as any;
    }

    async delete(id: string): Promise<void> {
        await prisma.appointment.delete({
            where: { id }
        });
    }
}
