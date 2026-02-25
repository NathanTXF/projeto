import { NextResponse } from 'next/server';
import { PrismaLoanRepository } from '@/modules/loans/infrastructure/repositories';
import { LoanUseCases } from '@/modules/loans/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

import { PrismaCommissionRepository } from '@/modules/commissions/infrastructure/repositories';
import { CommissionUseCases } from '@/modules/commissions/application/useCases';

import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';

const repository = new PrismaLoanRepository();
const commissionRepo = new PrismaCommissionRepository();
const financialRepo = new PrismaFinancialRepository();

const financialUseCases = new FinancialUseCases(financialRepo);
const commissionUseCases = new CommissionUseCases(commissionRepo);
const useCases = new LoanUseCases(repository);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const loan = await useCases.getById(id);
        if (!loan) {
            return NextResponse.json({ error: 'Empréstimo não encontrado' }, { status: 404 });
        }
        return NextResponse.json(loan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const body = await request.json();
        if (body.dataInicio) body.dataInicio = new Date(body.dataInicio);

        // Se estiver apenas alterando o status
        if (Object.keys(body).length === 1 && body.status) {
            const loan = await useCases.updateStatus(id, body.status, user.id, commissionUseCases);
            return NextResponse.json(loan);
        }

        const loan = await useCases.update(id, body, user.id);
        return NextResponse.json(loan);
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
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        await useCases.remove(id, user.id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        const status = error.message?.includes('não pode ser excluído') || error.message?.includes('possui') ? 400 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
