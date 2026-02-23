import { NextResponse } from 'next/server';
import { PrismaRoleRepository } from '@/modules/roles/infrastructure/repositories';
import { RoleUseCases } from '@/modules/roles/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { RoleSchema } from '@/modules/roles/domain/entities';

const repository = new PrismaRoleRepository();
const useCases = new RoleUseCases(repository);

export async function GET() {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.MANAGE_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const roles = await useCases.listAll();
        return NextResponse.json(roles);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || !hasPermission(currentUser.permissions || [], PERMISSIONS.MANAGE_ROLES)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const data = await request.json();
        const validatedData = RoleSchema.parse(data);

        const role = await useCases.create(validatedData);
        return NextResponse.json(role, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
