import { NextResponse } from 'next/server';
import { PrismaCommissionRepository } from '@/modules/commissions/infrastructure/repositories';
import { CommissionUseCases } from '@/modules/commissions/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';

const repository = new PrismaCommissionRepository();
const financialRepo = new PrismaFinancialRepository();
const financialUseCases = new FinancialUseCases(financialRepo);
const useCases = new CommissionUseCases(repository);

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params;
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_COMMISSIONS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'APPROVE') {
            const commission = await useCases.approve(id, user.id, financialUseCases);
            return NextResponse.json(commission);
        }

        if (action === 'CANCEL') {
            const commission = await useCases.cancel(id, user.id);
            return NextResponse.json(commission);
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
