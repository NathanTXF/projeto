import { NextResponse } from 'next/server';
import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

const repository = new PrismaFinancialRepository();
const useCases = new FinancialUseCases(repository);

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getAuthUser();
        // Apenas admin (nivelAcesso 1) pode realizar pagamento de comissão
        if (!user || user.nivelAcesso !== 1) {
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

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
