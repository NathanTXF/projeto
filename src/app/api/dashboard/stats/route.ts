import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

        const [
            totalClients,
            lastYearClients,
            activeLoans,
            totalCommissionsMonth,
            pendingCommissions,
            topSellers,
            clientsBySex,
            loansThisYear
        ] = await Promise.all([
            prisma.customer.count(),
            prisma.customer.count({ where: { createdAt: { lt: startOfYear } } }),
            prisma.loan.count({ where: { status: 'ATIVO' } }),
            prisma.commission.aggregate({
                _sum: { valorCalculado: true },
                where: { createdAt: { gte: startOfMonth } }
            }),
            prisma.commission.count({ where: { status: 'Em aberto' } }),
            prisma.user.findMany({
                select: {
                    id: true,
                    nome: true,
                    fotoUrl: true,
                    _count: {
                        select: { loans: true }
                    }
                },
                take: 5,
                orderBy: {
                    loans: {
                        _count: 'desc'
                    }
                }
            }),
            prisma.customer.groupBy({
                by: ['sexo'],
                _count: true
            }),
            prisma.loan.findMany({
                where: { dataInicio: { gte: startOfYear } },
                select: { dataInicio: true }
            })
        ]);

        // Calcular crescimento anual
        const growth = lastYearClients === 0 ? 100 : ((totalClients - lastYearClients) / lastYearClients) * 100;

        // Formatar dados do gráfico mensal
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
                totalClientsGrowth: growth.toFixed(1),
                activeLoans,
                totalCommissionsMonth: totalCommissionsMonth._sum?.valorCalculado ?? 0,
                pendingCommissions,
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
            loansByMonth: monthlyData
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
