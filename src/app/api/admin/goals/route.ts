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
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
        const userId = searchParams.get('userId') || undefined;

        if (userId && !month) {
            // Case 1: Fetch all 12 goals for a specific user and year
            const monthlyGoals = await prisma.goal.findMany({
                where: {
                    tipo: 'INDIVIDUAL',
                    userId: userId,
                    ano: year
                }
            });

            return NextResponse.json({
                userGoals: monthlyGoals
            });
        }

        // Default or single month logic
        const targetMonth = month || new Date().getMonth() + 1;

        const [users, monthlyGoals] = await Promise.all([
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
                where: { mes: targetMonth, ano: year }
            })
        ]);

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
        const { type, id, value, month, year, goals, action } = data;

        const m = month || new Date().getMonth() + 1;
        const y = year || new Date().getFullYear();
        const isCurrentMonth = m === (new Date().getMonth() + 1) && y === new Date().getFullYear();

        if (action === 'delete' && type === 'user' && id) {
            await prisma.goal.deleteMany({
                where: {
                    tipo: 'INDIVIDUAL',
                    userId: id,
                    mes: m,
                    ano: y
                }
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'batch' && Array.isArray(goals)) {
            // Processamento em lote
            await prisma.$transaction(
                goals.map((g: any) => {
                    const val = Math.round(Number(g.valor || 0));
                    return prisma.goal.upsert({
                        where: {
                            tipo_userId_mes_ano: {
                                tipo: 'INDIVIDUAL',
                                userId: g.userId,
                                mes: m,
                                ano: y
                            }
                        },
                        update: { valor: val },
                        create: {
                            tipo: 'INDIVIDUAL',
                            mes: m,
                            ano: y,
                            userId: g.userId,
                            valor: val
                        }
                    });
                })
            );

            // Atualizar fallbacks de usuários se for o mês atual
            if (isCurrentMonth) {
                await Promise.all(goals.map((g: any) =>
                    prisma.user.update({
                        where: { id: g.userId },
                        data: { metaVendasMensal: Math.round(Number(g.valor || 0)) }
                    })
                ));
            }

            return NextResponse.json({ success: true });
        }

        const val = Math.round(Number(value || 0));
        const goalType = type === 'company' ? 'GLOBAL' : 'INDIVIDUAL';
        const targetUserId = type === 'company' ? null : id;

        if (type !== 'company') {
            await prisma.goal.upsert({
                where: {
                    tipo_userId_mes_ano: {
                        tipo: goalType,
                        userId: targetUserId as string,
                        mes: m,
                        ano: y
                    }
                },
                update: { valor: val },
                create: {
                    tipo: goalType,
                    mes: m,
                    ano: y,
                    userId: targetUserId!,
                    valor: val
                }
            });
        }

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

