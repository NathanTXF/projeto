import { NextResponse } from 'next/server';
import { PrismaLoanRepository } from '@/modules/loans/infrastructure/repositories';
import { LoanUseCases } from '@/modules/loans/application/useCases';
import { LoanSchema } from '@/modules/loans/domain/entities';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaLoanRepository();
const useCases = new LoanUseCases(repository);

export async function GET() {
    try {
        const loans = await useCases.listAll();
        return NextResponse.json(loans);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();

        // Parse dates
        if (body.dataInicio) {
            body.dataInicio = new Date(body.dataInicio);
        }


        // Auto-fill seller if not provided or if requester does not have full edit rights
        if (!body.vendedorId || !hasPermission(user.permissions || [], PERMISSIONS.EDIT_LOANS)) {
            body.vendedorId = user.id;
        }

        const validatedData = LoanSchema.parse(body);
        const loan = await useCases.create(validatedData as any, user.id);

        return NextResponse.json(loan, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
