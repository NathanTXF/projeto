import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { logAudit } from '@/core/audit/logger';

const repository = new PrismaUserRepository();
const useCases = new UserUseCases(repository);

export async function GET() {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const profile = await useCases.getProfile(authUser.id);

        // Retorna o perfil atualizado, incluindo as permissões obtidas pelo JWT (Middleware-safe)
        return NextResponse.json({ ...profile, permissions: authUser.permissions || [], roleName: authUser.role });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();

        // REGRA MVP: Apenas admin redefine senha
        if (body.senha && authUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Apenas administradores podem alterar senhas' }, { status: 403 });
        }

        const updatedUser = await useCases.updateProfile(authUser.id, body);

        await logAudit({
            usuarioId: authUser.id,
            modulo: 'USERS',
            acao: 'UPDATE_PROFILE',
            entidadeId: authUser.id
        });

        const { senha: _, ...userWithoutPassword } = updatedUser as any;
        return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
