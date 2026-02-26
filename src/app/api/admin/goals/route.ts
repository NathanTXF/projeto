import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_SETTINGS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

        const [company, users, monthlyGoals] = await Promise.all([
            prisma.company.findFirst(),
            prisma.user.findMany({
                select: {
                    id: true,
                    nome: true,
                    usuario: true,
                    metaVendasMensal: true,
                    nivelAcesso: true
                },
                orderBy: { nome: 'asc' }
            }),
            prisma.goal.findMany({
                where: { mes: month, ano: year }
            })
        ]);

        // Cálculo da Meta Global (Soma das metas individuais dos usuários)
        const userGoalsList = users.map(u => {
            const specificGoal = monthlyGoals.find(g => g.tipo === 'INDIVIDUAL' && g.userId === u.id);
            return {
                id: u.id,
                name: u.nome,
                username: u.usuario,
                goal: specificGoal ? specificGoal.valor : Number(u.metaVendasMensal || 10),
                isAdmin: u.nivelAcesso === 1
            };
        });

        const aggregatedGlobalGoal = userGoalsList.reduce((acc, curr) => acc + curr.goal, 0);

        return NextResponse.json({
            companyGoal: aggregatedGlobalGoal,
            userGoals: userGoalsList
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_SETTINGS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const data = await request.json();
        const { type, id, value, month, year } = data; // type: 'company' | 'user'

        const m = month || new Date().getMonth() + 1;
        const y = year || new Date().getFullYear();
        const val = Math.round(Number(value || 0));

        const goalType = type === 'company' ? 'GLOBAL' : 'INDIVIDUAL';
        const targetUserId = type === 'company' ? null : id;

        // Se for meta de empresa (GLOBAL), não salvamos na tabela Goal (pois é calculada como soma)
        // Apenas atualizamos o fallback no modelo Company se for o mês atual abaixo.
        if (type !== 'company') {
            // Tentar encontrar meta existente para o período
            const existing = await prisma.goal.findFirst({
                where: {
                    tipo: goalType,
                    userId: targetUserId,
                    mes: m,
                    ano: y
                }
            });

            if (existing) {
                await prisma.goal.update({
                    where: { id: existing.id },
                    data: { valor: val }
                });
            } else {
                await prisma.goal.create({
                    data: {
                        tipo: goalType,
                        userId: targetUserId,
                        mes: m,
                        ano: y,
                        valor: val
                    }
                });
            }
        }

        // Se for o mês atual, também atualizamos o fallback no User/Company para manter legibilidade rápida
        const isCurrentMonth = m === (new Date().getMonth() + 1) && y === new Date().getFullYear();
        if (isCurrentMonth) {
            if (type === 'company') {
                const company = await prisma.company.findFirst();
                if (company) {
                    await prisma.company.update({
                        where: { id: company.id },
                        data: { metaVendasMensal: val }
                    });
                }
            } else if (id) {
                await prisma.user.update({
                    where: { id },
                    data: { metaVendasMensal: val }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Goals API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
