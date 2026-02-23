import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || !hasPermission(user.permissions || [], PERMISSIONS.MANAGE_SETTINGS)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const [company, users] = await Promise.all([
            prisma.company.findFirst(),
            prisma.user.findMany({
                select: {
                    id: true,
                    nome: true,
                    usuario: true,
                    metaMensal: true,
                    nivelAcesso: true
                },
                orderBy: { nome: 'asc' }
            })
        ]);

        return NextResponse.json({
            companyGoal: Number(company?.metaMensal || 50000),
            userGoals: users.map(u => ({
                id: u.id,
                name: u.nome,
                username: u.usuario,
                goal: Number(u.metaMensal || 5000),
                isAdmin: u.nivelAcesso === 1
            }))
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
        const { type, id, value } = data; // type: 'company' | 'user'

        if (type === 'company') {
            const company = await prisma.company.findFirst();
            if (company) {
                await prisma.company.update({
                    where: { id: company.id },
                    data: { metaMensal: value }
                });
            } else {
                // Should not happen if company is seeded, but defensive
                await prisma.company.create({
                    data: {
                        nome: 'Dinheiro Fácil',
                        cnpj: '00.000.000/0000-00',
                        contato: '',
                        endereco: '',
                        metaMensal: value
                    }
                });
            }
        } else if (type === 'user' && id) {
            await prisma.user.update({
                where: { id },
                data: { metaMensal: value }
            });
        } else {
            return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Goals API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
