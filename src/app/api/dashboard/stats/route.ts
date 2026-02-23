import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

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
            loansThisYear,
            loansByBankRaw,
            loansByTypeRaw,
            volumeMonthRaw
        ] = await Promise.all([
            // 1. Total de Clientes
            prisma.customer.count({
                where: isAdmin ? {} : {
                    loans: { some: { vendedorId: user.id } }
                }
            }),
            // 2. Clientes ano passado (para crescimento)
            prisma.customer.count({
                where: {
                    ...(isAdmin ? {} : { loans: { some: { vendedorId: user.id } } }),
                    createdAt: { lt: startOfYear }
                }
            }),
            // 3. Contratos Ativos
            prisma.loan.count({
                where: { ...whereVendedor, status: 'ATIVO' }
            }),
            // 4. Comissões do Mês
            prisma.commission.aggregate({
                _sum: { valorCalculado: true },
                where: { ...whereVendedor, createdAt: { gte: startOfMonth } }
            }),
            // 5. Comissões Mês Passado
            prisma.commission.aggregate({
                _sum: { valorCalculado: true },
                where: { ...whereVendedor, createdAt: { gte: startOfLastMonth, lt: startOfMonth } }
            }),
            // 6. Comissões Pendentes
            prisma.commission.count({
                where: { ...whereVendedor, status: 'Em aberto' }
            }),
            // 7. Top Vendedores
            prisma.user.findMany({
                select: {
                    id: true,
                    nome: true,
                    fotoUrl: true,
                    _count: { select: { loans: true } }
                },
                take: 5,
                orderBy: { loans: { _count: 'desc' } }
            }),
            // 8. Distribuição Sexo
            prisma.customer.groupBy({
                by: ['sexo'],
                _count: true,
                where: isAdmin ? {} : { loans: { some: { vendedorId: user.id } } }
            }),
            // 9. Empréstimos do Ano
            prisma.loan.findMany({
                where: { ...whereVendedor, dataInicio: { gte: startOfYear } },
                select: { dataInicio: true }
            }),
            // 10. Ranking de Bancos (Senior)
            prisma.loan.groupBy({
                by: ['bancoId'],
                _count: true,
                _sum: { valorBruto: true },
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } },
                orderBy: { _sum: { valorBruto: 'desc' } },
                take: 5
            }),
            // 11. Mix de Produtos (Senior)
            prisma.loan.groupBy({
                by: ['tipoId'],
                _count: true,
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } }
            }),
            // 12. Volume Bruto Mensal (Senior)
            prisma.loan.aggregate({
                _sum: { valorBruto: true },
                _count: true,
                where: { ...whereVendedor, dataInicio: { gte: startOfMonth } }
            })
        ]);

        // Carregar nomes de Bancos e Tipos
        const [banks, loanTypes] = await Promise.all([
            prisma.bank.findMany({ where: { id: { in: loansByBankRaw.map(b => b.bancoId) } } }),
            prisma.loanType.findMany({ where: { id: { in: loansByTypeRaw.map(t => t.tipoId) } } })
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

        // Forecast (Previsão de Fim de Mês)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const forecastVolume = currentDay === 0 ? 0 : (totalVolumeMonth / currentDay) * daysInMonth;

        // Formatar dados do gráfico mensal (Histórico)
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(now.getFullYear(), i, 1)),
            total: 0
        }));

        loansThisYear.forEach(loan => {
            const month = new Date(loan.dataInicio).getMonth();
            monthlyData[month].total++;
        });

        return NextResponse.json({
            stats: {
                totalClients,
                totalClientsGrowth: growthClients.toFixed(1),
                activeLoans: activeLoansCount,
                totalCommissionsMonth: currentComm,
                commissionsGrowth: growthComm.toFixed(1),
                pendingCommissions,
                ticketMedio,
                forecastVolume
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
            loansByMonth: monthlyData,
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
