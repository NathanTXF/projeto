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

        const [
            totalClients,
            activeLoans,
            totalCommissionsMonth,
            pendingCommissions,
            topSellers
        ] = await Promise.all([
            prisma.customer.count(),
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
            })
        ]);

        return NextResponse.json({
            stats: {
                totalClients,
                activeLoans,
                totalCommissionsMonth: totalCommissionsMonth._sum?.valorCalculado ?? 0,
                pendingCommissions,
            },
            topSellers: topSellers.map(s => ({
                id: s.id,
                nome: s.nome,
                vendas: s._count.loans
            }))
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
