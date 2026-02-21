import { NextResponse } from 'next/server';
import { PrismaAppointmentRepository } from '@/modules/agenda/infrastructure/repositories';
import { AgendaUseCases } from '@/modules/agenda/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

const repository = new PrismaAppointmentRepository();
const useCases = new AgendaUseCases(repository);

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { id } = await params;
        await useCases.cancelAppointment(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
