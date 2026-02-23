import { NextResponse } from 'next/server';
import { PrismaCommissionRepository } from '@/modules/commissions/infrastructure/repositories';
import { CommissionUseCases } from '@/modules/commissions/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaCommissionRepository();
const useCases = new CommissionUseCases(repository);

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_COMMISSIONS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        let mesAno = searchParams.get('mesAno') || undefined;
        let vendedorId = searchParams.get('vendedorId') || undefined;

        // Regra Senior: Se não for gestor, só pode ver as próprias comissões
        if (!hasPermission(user.permissions || [], PERMISSIONS.MANAGE_COMMISSIONS)) {
            vendedorId = user.id;
        }

        if (mesAno || vendedorId) {
            const commissions = await useCases.getByFilters({ mesAno, vendedorId });
            return NextResponse.json(commissions);
        }

        const commissions = await useCases.listAll();
        return NextResponse.json(commissions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_COMMISSIONS)) {
            return NextResponse.json({ error: 'Apenas administradores podem gerar comissões manualmente' }, { status: 403 });
        }

        const body = await request.json();
        const commission = await useCases.calculateAndCreate({
            ...body,
            requesterId: user.id,
        });

        return NextResponse.json(commission, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
