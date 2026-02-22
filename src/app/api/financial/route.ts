import { NextResponse } from 'next/server';
import { PrismaFinancialRepository } from '@/modules/financial/infrastructure/repositories';
import { FinancialUseCases } from '@/modules/financial/application/useCases';

const repository = new PrismaFinancialRepository();
const useCases = new FinancialUseCases(repository);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mesAno = searchParams.get('mesAno') || undefined;
        const vendedorId = searchParams.get('vendedorId') || undefined;

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
