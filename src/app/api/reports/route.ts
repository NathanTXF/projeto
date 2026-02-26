import { NextResponse } from 'next/server';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { PrismaReportRepository } from '@/modules/reports/infrastructure/repositories';
import { ReportTypeEnum } from '@/modules/reports/domain/entities';

const repository = new PrismaReportRepository();

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_USERS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const sellerId = searchParams.get('sellerId') || undefined;
        const bankId = searchParams.get('bankId') ? Number(searchParams.get('bankId')) : undefined;
        const organId = searchParams.get('organId') ? Number(searchParams.get('organId')) : undefined;
        const status = searchParams.get('status') || undefined;

        if (!type || !ReportTypeEnum.safeParse(type).success) {
            return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 });
        }

        const params = {
            type: type as any,
            startDate,
            endDate,
            sellerId,
            bankId,
            organId,
            status,
        };

        let data;
        switch (type) {
            case 'SALES':
                data = await repository.getSalesReport(params);
                break;
            case 'COMMISSIONS':
                data = await repository.getCommissionReport(params);
                break;
            case 'FINANCIAL':
                data = await repository.getFinancialReport(params);
                break;
            case 'PERFORMANCE':
                data = await repository.getPerformanceReport(params);
                break;
            case 'CUSTOMERS':
                data = await repository.getCustomersReport(params);
                break;
            case 'BANKS':
            case 'ORGANS':
            case 'GROUPS':
            case 'TABLES':
            case 'LOAN_TYPES':
            case 'OPERATORS':
                data = await repository.getCategoricalReport(params);
                break;
            default:
                return NextResponse.json({ error: 'Relatório não implementado' }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Reports API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
