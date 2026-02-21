import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { UserSchema } from '@/modules/users/domain/entities';

const repository = new PrismaUserRepository();
const useCases = new UserUseCases(repository);

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const id = params.id;
        const data = await request.json();

        // Para atualização, não exigimos senha
        const validatedData = UserSchema.partial().parse(data);

        const user = await useCases.updateProfile(id, validatedData);
        return NextResponse.json(user);
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
        if (!currentUser || currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const id = params.id;

        // Evitar que o usuário se delete a si mesmo
        if (id === currentUser.id) {
            return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário' }, { status: 400 });
        }

        await useCases.removeUser(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
