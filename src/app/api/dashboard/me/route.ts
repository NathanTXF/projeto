import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { startOfDay, startOfMonth, startOfYear, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

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
            where: { vendedorId: user.id },
            select: {
                valorCalculado: true,
                status: true
            }
        });

        const totalReceived = commissions
            .filter(c => c.status === 'Pago' || c.status === 'Aprovado') // Adaptar conforme status real
            .reduce((acc, c) => acc + Number(c.valorCalculado), 0);

        const totalPending = commissions
            .filter(c => c.status === 'Em aberto')
            .reduce((acc, c) => acc + Number(c.valorCalculado), 0);

        // 3. Próximos Compromissos (Privados + Globais)
        const appointments = await prisma.appointment.findMany({
            where: {
                OR: [
                    { criadorId: user.id },
                    { destinatarioId: user.id },
                    { visibilidade: 'GLOBAL' }
                ],
                data: { gte: today }
            },
            orderBy: [
                { data: 'asc' },
                { hora: 'asc' }
            ],
            take: 5,
            include: {
                criador: { select: { nome: true } }
            }
        });

        // 4. Histórico de Cadastros (Últimos 12 meses) para o gráfico
        const history = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = startOfMonth(date);
            const end = i === 0 ? now : new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const count = await prisma.customer.count({
                where: {
                    vendedorId: user.id,
                    createdAt: { gte: start, lte: end }
                }
            });

            history.push({
                month: date.toLocaleString('pt-BR', { month: 'short' }),
                year: date.getFullYear(),
                count
            });
        }

        return NextResponse.json({
            metrics: {
                customers: { today: todayCount, month: monthCount, year: yearCount },
                commissions: { received: totalReceived, pending: totalPending }
            },
            appointments,
            history
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
