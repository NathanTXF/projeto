import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const now = new Date();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const isAdmin = hasPermission(user.permissions || [], PERMISSIONS.VIEW_DASHBOARD) && hasPermission(user.permissions || [], PERMISSIONS.VIEW_FINANCIAL);
        const whereVendedor = isAdmin ? {} : { vendedorId: user.id };

        // Promessas principais
        const [
            totalClients,
            lastYearClients,
            activeLoansCount,
            totalCommissionsMonth,
            lastMonthCommissions,
            pendingCommissions,
            topSellers,
            clientsBySex,
            loansOfSelectedYear,
            loansByBankRaw,
            loansByTypeRaw,
            volumeMonthRaw,
            company,
            periodGoal
        ] = await Promise.all([
            prisma.customer.count({ where: isAdmin ? {} : { loans: { some: { vendedorId: user.id } } } }),
            prisma.customer.count({
                where: {
                    ...(isAdmin ? {} : { loans: { some: { vendedorId: user.id } } }),
                    createdAt: { lt: startOfYear }
                }
            }),
            prisma.loan.count({ where: { ...whereVendedor, status: 'ATIVO' } }),
            prisma.commission.aggregate({
                _sum: { valorCalculado: true },
                where: { ...whereVendedor, createdAt: { gte: startOfMonth } }
            }),
            prisma.commission.aggregate({
                _sum: { valorCalculado: true },
                where: { ...whereVendedor, createdAt: { gte: startOfLastMonth, lt: startOfMonth } }
            }),
            prisma.commission.count({ where: { ...whereVendedor, status: 'Em aberto' } }),
            prisma.user.findMany({
                select: { id: true, nome: true, fotoUrl: true, _count: { select: { loans: true } } },
                take: 5,
                orderBy: { loans: { _count: 'desc' } }
            }),
            prisma.customer.groupBy({
                by: ['sexo'],
                _count: true,
                where: isAdmin ? {} : { loans: { some: { vendedorId: user.id } } }
            }),
            prisma.loan.findMany({ where: { ...whereVendedor, dataInicio: { gte: startOfYear } }, select: { dataInicio: true } }),
            prisma.loan.groupBy({
                by: ['bancoId'],
                _count: true,
                _sum: { valorBruto: true },
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } },
                orderBy: { _sum: { valorBruto: 'desc' } },
                take: 5
            }),
            prisma.loan.groupBy({
                by: ['tipoId'],
                _count: true,
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } }
            }),
            prisma.loan.aggregate({
                _sum: { valorBruto: true },
                _count: true,
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } }
            }),
            prisma.company.findFirst(), // Buscar meta global default
            prisma.goal.findFirst({ // Buscar meta global específica do período
                where: {
                    tipo: 'GLOBAL',
                    mes: now.getMonth() + 1,
                    ano: now.getFullYear()
                }
            })
        ]);

        // Carregar nomes de Bancos e Tipos
        const [banks, loanTypes] = await Promise.all([
            prisma.bank.findMany({ where: { id: { in: loansByBankRaw.map((b: any) => b.bancoId) } } }),
            prisma.loanType.findMany({ where: { id: { in: loansByTypeRaw.map((t: any) => t.tipoId) } } })
        ]);

        const bankMap = new Map(banks.map(b => [b.id, b.nome]));
        const typeMap = new Map(loanTypes.map(t => [t.id, t.nome]));

        // Cálculos de Crescimento e Projeção
        const growthClients = lastYearClients === 0 ? 100 : ((totalClients - lastYearClients) / lastYearClients) * 100;
        const currentComm = Number(totalCommissionsMonth._sum?.valorCalculado || 0);
        const lastComm = Number(lastMonthCommissions._sum?.valorCalculado || 0);
        const growthComm = lastComm === 0 ? (currentComm > 0 ? 100 : 0) : ((currentComm - lastComm) / lastComm) * 100;

        // Ticket Médio
        const totalVolumeMonth = Number(volumeMonthRaw._sum?.valorBruto || 0);
        const totalLoansMonth = volumeMonthRaw._count || 0;
        const ticketMedio = totalLoansMonth === 0 ? 0 : totalVolumeMonth / totalLoansMonth;

        // Forecast
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const forecastVolume = currentDay === 0 ? 0 : (totalVolumeMonth / currentDay) * daysInMonth;

        return NextResponse.json({
            stats: {
                totalClients,
                totalClientsGrowth: growthClients.toFixed(1),
                activeLoans: activeLoansCount,
                totalCommissionsMonth: currentComm,
                commissionsGrowth: growthComm.toFixed(1),
                pendingCommissions,
                ticketMedio,
                forecastVolume,
                metaVendasGlobal: Number(periodGoal?.valor ?? company?.metaVendasMensal ?? 100),
                totalSalesMonth: volumeMonthRaw._count || 0
            },
            topSellers: topSellers.map(s => ({
                id: s.id,
                nome: s.nome,
                fotoUrl: s.fotoUrl,
                vendas: s._count.loans
            })),
            clientsBySex: clientsBySex.map(c => ({
                name: c.sexo === 'masculino' ? 'Masculino' : 'Feminino',
                value: c._count
            })),
            loansByMonth: Array.from({ length: 12 }, (_, i) => ({
                name: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, i, 1)),
                total: loansOfSelectedYear.filter(l => new Date(l.dataInicio).getMonth() === i).length
            })),
            loansByBank: loansByBankRaw.map(b => ({
                name: bankMap.get(b.bancoId) || 'Outros',
                value: Number(b._sum.valorBruto || 0)
            })),
            loansByType: loansByTypeRaw.map(t => ({
                name: typeMap.get(t.tipoId) || 'Outros',
                value: t._count
            }))
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
