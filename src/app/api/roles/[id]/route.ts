import { NextResponse } from 'next/server';
import { PrismaRoleRepository } from '@/modules/roles/infrastructure/repositories';
import { RoleUseCases } from '@/modules/roles/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { RoleSchema } from '@/modules/roles/domain/entities';

const repository = new PrismaRoleRepository();
const useCases = new RoleUseCases(repository);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.VIEW_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        const role = await useCases.getById(id);

        if (!role) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.EDIT_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        const data = await request.json();

        const validatedData = RoleSchema.partial().parse(data);

        const role = await useCases.update(id, validatedData);
        return NextResponse.json(role);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.DELETE_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;

        // Evitar deletar perfil do próprio usuário
        if (currentUser.role === id) {
            return NextResponse.json({ error: 'Você não pode excluir seu próprio perfil ativo.' }, { status: 400 });
        }

        await useCases.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
