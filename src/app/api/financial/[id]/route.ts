import { NextResponse } from 'next/server';
import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaFinancialRepository();
const useCases = new FinancialUseCases(repository);

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params;
        const user = await getAuthUser();
        // Apenas com permissão financeira pode realizar pagamento de comissão
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.EDIT_FINANCIAL)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await request.json();
        const { action, pagoEm, comprovanteUrl } = body;

        if (action === 'PAY') {
            if (!pagoEm) {
                return NextResponse.json({ error: 'Data de pagamento é obrigatória' }, { status: 400 });
            }

            const financial = await useCases.payCommission(
                id,
                new Date(pagoEm),
                comprovanteUrl,
                user.id
            );
            return NextResponse.json(financial);
        }

        if (action === 'EDIT') {
            const { valorTotal } = body;
            const financial = await useCases.editPaid(id, { valorTotal: Number(valorTotal) }, user.id);
            return NextResponse.json(financial);
        }

        if (action === 'CANCEL_PAYMENT') {
            const financial = await useCases.cancelPayment(id, user.id);
            return NextResponse.json(financial);
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getAuthUser();

        // Apenas com permissão de editar/deletar financeiro ou admin
        if (!user || (!hasPermission(user.permissions || [], PERMISSIONS.DELETE_FINANCIAL))) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        await useCases.reverseTransaction(id, user.id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
