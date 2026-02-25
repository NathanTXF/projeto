import { NextResponse } from 'next/server';
import { PrismaCustomerRepository } from '@/modules/clients/infrastructure/repositories';
import { CustomerUseCases } from '@/modules/clients/application/useCases';
import { CustomerSchema } from '@/modules/clients/domain/entities';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaCustomerRepository();
const useCases = new CustomerUseCases(repository);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_CLIENTS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        const customer = await useCases.getById(id);
        if (!customer) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }
        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.EDIT_CLIENTS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        if (body.dataNascimento) {
            body.dataNascimento = new Date(body.dataNascimento);
        }

        const customer = await useCases.update(id, body, user.id);
        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.DELETE_CLIENTS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        await useCases.remove(id, user.id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        const status = error.message?.includes('não pode ser excluído') ? 400 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
