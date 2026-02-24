import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { startOfDay, startOfMonth, startOfYear } from 'date-fns';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Fetch user from DB to get the specific metaMensal
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { metaMensal: true }
        });

        const now = new Date();
        const today = startOfDay(now);
        const thisMonth = startOfMonth(now);
        const thisYear = startOfYear(now);

        // 1. Métricas de Clientes (Cadastrados por ele)
        const [todayCount, monthCount, yearCount] = await Promise.all([
            prisma.customer.count({
                where: { vendedorId: user.id, createdAt: { gte: today } }
            }),
            prisma.customer.count({
                where: { vendedorId: user.id, createdAt: { gte: thisMonth } }
            }),
            prisma.customer.count({
                where: { vendedorId: user.id, createdAt: { gte: thisYear } }
            })
        ]);

        // 2. Comissões (Dashboard Pessoal)
        const commissions = await prisma.commission.findMany({
            where: { vendedorId: user.id, createdAt: { gte: thisMonth } },
            select: {
                valorCalculado: true,
                status: true
            }
        });

        const financials = await prisma.financial.findMany({
            where: { vendedorId: user.id, createdAt: { gte: thisMonth } },
            select: { valorTotal: true, status: true }
        });

        const totalReceivedMonth = financials
            .filter(f => f.status?.toLowerCase() === 'pago')
            .reduce((acc, f) => acc + Number(f.valorTotal), 0);

        const totalPendingMonth = commissions
            .filter(c => c.status?.toLowerCase() === 'em aberto' || c.status?.toLowerCase() === 'em_aberto' || c.status?.toLowerCase() === 'aprovado')
            .reduce((acc, c) => acc + Number(c.valorCalculado), 0);

        // 3. Pipeline de Vendas (Mês)
        const pipelineRaw = await prisma.loan.groupBy({
            by: ['status'],
            where: { vendedorId: user.id, dataInicio: { gte: thisMonth } },
            _count: true,
            _sum: { valorLiquido: true }
        });

        const pipeline = {
            digitacao: pipelineRaw.find(p => p.status === 'DIGITACAO')?._count || 0,
            analise: pipelineRaw.find(p => p.status === 'ANALISE')?._count || 0,
            averbacao: pipelineRaw.find(p => p.status === 'AVERBACAO')?._count || 0,
            pagos: pipelineRaw.find(p => p.status === 'PAGO' || p.status === 'ATIVO')?._count || 0,
            volumePendente: pipelineRaw
                .filter(p => !['PAGO', 'CANCELADO'].includes(p.status))
                .reduce((acc, p) => acc + Number(p._sum.valorLiquido || 0), 0)
        };

        // 4. Ranking
        const sellerRanking = await prisma.loan.groupBy({
            by: ['vendedorId'],
            where: { dataInicio: { gte: thisMonth } },
            _count: true,
            orderBy: {
                _count: {
                    vendedorId: 'desc'
                }
            }
        });

        const myPosition = sellerRanking.findIndex(r => r.vendedorId === user.id) + 1;

        // 5. Próximos Compromissos
        const appointments = await prisma.appointment.findMany({
            where: {
                OR: [
                    { criadorId: user.id },
                    { destinatarioId: user.id },
                    { visibilidade: 'GLOBAL' }
                ],
                data: { gte: today }
            },
            orderBy: [{ data: 'asc' }, { hora: 'asc' }],
            take: 5,
            include: { criador: { select: { nome: true } } }
        });

        // 6. Histórico de Cadastros (12 meses)
        const history = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = startOfMonth(date);
            const end = i === 0 ? now : new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const count = await prisma.customer.count({
                where: { vendedorId: user.id, createdAt: { gte: start, lte: end } }
            });

            history.push({
                month: date.toLocaleString('pt-BR', { month: 'short' }),
                count
            });
        }

        // 7. Dados de Hub (Global) para Admins
        const isAdmin = user.nivelAcesso === 1;
        let hub = null;

        if (isAdmin) {
            const [pendingApproval, toPayFinancial, totalLoans] = await Promise.all([
                prisma.commission.count({ where: { status: 'EM_ABERTO' } }),
                prisma.financial.aggregate({
                    _sum: { valorTotal: true },
                    where: { status: 'Em aberto' }
                }),
                prisma.loan.count({ where: { dataInicio: { gte: thisMonth } } })
            ]);

            hub = {
                pendingApproval,
                totalToPay: Number(toPayFinancial._sum?.valorTotal || 0),
                totalLoansMonth: totalLoans
            };
        }

        return NextResponse.json({
            user: {
                nome: user.nome,
                nivelAcesso: user.nivelAcesso
            },
            metrics: {
                customers: { today: todayCount, month: monthCount, year: yearCount },
                commissions: { received: totalReceivedMonth, pending: totalPendingMonth },
                metaMensal: Number(dbUser?.metaMensal || 5000),
                rankingPosition: myPosition || '-'
            },
            pipeline,
            appointments,
            history,
            hub
        });

    } catch (error: any) {
        console.error("Dashboard ME API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
