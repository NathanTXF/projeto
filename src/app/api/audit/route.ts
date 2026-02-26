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

        const statsOnly = searchParams.get('stats') === 'true';

        if (statsOnly) {
            const allLogs = await useCases.listLogs({
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h for stats
            });

            const stats = {
                failedLogins: allLogs.filter(l => l.acao.includes('LOGIN_FAILED')).length,
                criticalDeletes: allLogs.filter(l => l.acao.includes('DELETE')).length,
                mostActiveModule: Object.entries(
                    allLogs.reduce((acc: any, curr) => {
                        acc[curr.modulo] = (acc[curr.modulo] || 0) + 1;
                        return acc;
                    }, {})
                ).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A',
                totalActivities: allLogs.length
            };

            return NextResponse.json(stats);
        }

        const logs = await useCases.listLogs(filters);
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
