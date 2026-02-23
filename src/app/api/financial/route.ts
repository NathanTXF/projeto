import { NextResponse } from 'next/server';
import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaFinancialRepository();
const useCases = new FinancialUseCases(repository);

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_FINANCIAL)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        let mesAno = searchParams.get('mesAno') || undefined;
        let vendedorId = searchParams.get('vendedorId') || undefined;

        // Regra Senior: Vendedores só veem o próprio financeiro
        if (!hasPermission(user.permissions || [], PERMISSIONS.MANAGE_FINANCIAL)) {
            vendedorId = user.id;
        }

        let transactions;
        if (vendedorId) {
            transactions = await useCases.getByVendedor(vendedorId);
        } else if (mesAno) {
            transactions = await useCases.getByPeriod(mesAno);
        } else {
            transactions = await useCases.listAll();
        }

        return NextResponse.json({ transactions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
