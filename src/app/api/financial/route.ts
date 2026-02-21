import { NextResponse } from 'next/server';
import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

const repository = new PrismaFinancialRepository();
const useCases = new FinancialUseCases(repository);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (start && end) {
            const transactions = await useCases.getMovementByPeriod(new Date(start), new Date(end));
            return NextResponse.json(transactions);
        }

        const transactions = await useCases.listAll();
        const balance = await useCases.getBalance();

        return NextResponse.json({ transactions, balance });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await request.json();
        const transaction = await useCases.registerTransaction({
            ...body,
            data: new Date(body.data),
        }, user.id);

        return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
