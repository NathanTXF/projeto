import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { getErrorMessage } from '@/lib/error-utils';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const clients = await prisma.customer.findMany({
            where: {
                OR: [
                    { nome: { contains: query, mode: 'insensitive' } },
                    { cpfCnpj: { contains: query } }
                ]
            },
            take: 10,
            select: {
                id: true,
                nome: true,
                cpfCnpj: true
            }
        });

        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
