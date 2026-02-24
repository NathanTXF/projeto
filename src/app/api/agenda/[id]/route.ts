import { NextResponse } from 'next/server';
import { PrismaAppointmentRepository } from '@/modules/agenda/infrastructure/repositories';
import { AgendaUseCases } from '@/modules/agenda/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

const repository = new PrismaAppointmentRepository();
const useCases = new AgendaUseCases(repository);

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const data = await request.json();

        // Verificar se o compromisso existe e se o usuário tem permissão
        const appointment = await repository.findById(id);
        if (!appointment) return NextResponse.json({ error: 'Compromisso não encontrado' }, { status: 404 });

        if (appointment.criadorId !== currentUser.id && currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Sem permissão para alterar este compromisso' }, { status: 403 });
        }

        const updated = await repository.update(id, data);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const appointment = await repository.findById(id);
        if (!appointment) return NextResponse.json({ error: 'Compromisso não encontrado' }, { status: 404 });

        if (appointment.criadorId !== currentUser.id && currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Sem permissão para remover este compromisso' }, { status: 403 });
        }

        await useCases.cancelAppointment(id); // Assume cancelAppointment calls delete or updates status
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
