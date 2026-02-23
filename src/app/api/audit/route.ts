import { NextResponse } from 'next/server';
import { PrismaAuditRepository } from '@/modules/audit/infrastructure/repositories';
import { AuditUseCases } from '@/modules/audit/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';

import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const repository = new PrismaAuditRepository();
const useCases = new AuditUseCases(repository);

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_AUDIT)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const usuarioId = searchParams.get('usuarioId') || undefined;
        const modulo = searchParams.get('modulo') || undefined;
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const filters: any = { usuarioId, modulo };

        if (startDateParam) filters.startDate = new Date(startDateParam);
        if (endDateParam) filters.endDate = new Date(endDateParam);

        const logs = await useCases.listLogs(filters);
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
