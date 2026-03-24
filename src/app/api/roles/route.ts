import { NextResponse } from 'next/server';
import { PrismaRoleRepository } from '@/modules/roles/infrastructure/repositories';
import { RoleUseCases } from '@/modules/roles/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { RoleSchema } from '@/modules/roles/domain/entities';
import { getErrorMessage } from '@/lib/error-utils';

const repository = new PrismaRoleRepository();
const useCases = new RoleUseCases(repository);

export async function GET() {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.VIEW_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const roles = await useCases.listAll();
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.CREATE_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const data = await request.json();
        const validatedData = RoleSchema.parse(data);

        const role = await useCases.create(validatedData);
        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            const zodError = error as { errors?: unknown };
            return NextResponse.json({ error: zodError.errors }, { status: 400 });
        }
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
