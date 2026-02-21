import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { UserSchema } from '@/modules/users/domain/entities';

const repository = new PrismaUserRepository();
const useCases = new UserUseCases(repository);

export async function GET() {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const users = await useCases.listAll();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const data = await request.json();
        const validatedData = UserSchema.parse(data);

        const user = await useCases.createUser(validatedData as any);
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
