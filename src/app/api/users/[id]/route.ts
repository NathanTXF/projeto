import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { UserSchema } from '@/modules/users/domain/entities';

const repository = new PrismaUserRepository();
const useCases = new UserUseCases(repository);

import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || (!hasPermission(currentUser.permissions || [], PERMISSIONS.MANAGE_USERS) && currentUser.id !== (await params).id)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;
        const data = await request.json();

        // Para atualização, não exigimos senha
        const validatedData = UserSchema.partial().parse(data);

        const user = await useCases.updateProfile(id, validatedData);
        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.MANAGE_USERS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await params;

        // Evitar que o usuário se delete a si mesmo
        if (id === currentUser.id) {
            return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário' }, { status: 400 });
        }

        await useCases.removeUser(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        const status = error.message?.includes('não pode ser excluído') ? 400 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
