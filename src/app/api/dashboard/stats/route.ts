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
            prisma.cliente.count(),
            prisma.emprestimo.count({ where: { status: 'ATIVO' } }),
            prisma.comissao.aggregate({
                _sum: { valor: true },
                where: { createdAt: { gte: startOfMonth } }
            }),
            prisma.comissao.count({ where: { status: 'PENDENTE' } }),
            prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    _count: {
                        select: { emprestimos: true }
                    }
                },
                take: 5,
                orderBy: {
                    emprestimos: {
                        _count: 'desc'
                    }
                }
            })
        ]);

        return NextResponse.json({
            stats: {
                totalClients,
                activeLoans,
                totalCommissionsMonth: totalCommissionsMonth._sum.valor || 0,
                pendingCommissions,
            },
            topSellers: topSellers.map(s => ({
                id: s.id,
                nome: s.nome,
                vendas: s._count.emprestimos
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
