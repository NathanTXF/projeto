import { NextResponse } from 'next/server';
import { PrismaCompanyRepository } from '@/modules/company/infrastructure/repositories';
import { CompanyUseCases } from '@/modules/company/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { CompanySchema } from '@/modules/company/domain/entities';

const repository = new PrismaCompanyRepository();
const useCases = new CompanyUseCases(repository);

export async function GET() {
    try {
        const settings = await useCases.getSettings();
        return NextResponse.json(settings || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const data = await request.json();
        const validatedData = CompanySchema.partial().parse(data);

        const settings = await useCases.updateSettings(validatedData);
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
