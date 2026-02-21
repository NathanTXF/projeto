import { NextResponse } from 'next/server';
import { PrismaCommissionRepository } from '@/modules/commissions/infrastructure/repositories';
import { CommissionUseCases } from '@/modules/commissions/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

const repository = new PrismaCommissionRepository();
const useCases = new CommissionUseCases(repository);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mesAno = searchParams.get('mesAno') || undefined;
        const vendedorId = searchParams.get('vendedorId') || undefined;

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
        if (!user || user.nivelAcesso !== 1) {
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
