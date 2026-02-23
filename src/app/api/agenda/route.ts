import { NextResponse } from 'next/server';
import { PrismaAppointmentRepository } from '@/modules/agenda/infrastructure/repositories';
import { AgendaUseCases } from '@/modules/agenda/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { AppointmentSchema } from '@/modules/agenda/domain/entities';

const repository = new PrismaAppointmentRepository();
const useCases = new AgendaUseCases(repository);

export async function GET(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const userId = searchParams.get('userId');

        if (dateStr) {
            const date = new Date(dateStr);
            const appointments = await useCases.getDailyAppointments(date, currentUser.id);
            return NextResponse.json(appointments);
        }

        if (userId) {
            const appointments = await useCases.getUserAppointments(userId);
            return NextResponse.json(appointments);
        }

        // Default: todos do usuário logado
        const appointments = await useCases.getUserAppointments(currentUser.id);
        return NextResponse.json(appointments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const data = await request.json();
        const validatedData = AppointmentSchema.parse({
            ...data,
            data: new Date(data.data),
            criadorId: currentUser.id,
            destinatarioId: data.destinatarioId === 'all' ? null : data.destinatarioId,
            visibilidade: data.visibilidade || 'PRIVADO'
        });

        const appointment = await useCases.scheduleAppointment(validatedData as any);
        return NextResponse.json(appointment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
