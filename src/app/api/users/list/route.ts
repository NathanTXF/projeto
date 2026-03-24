import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/core/auth/getUser';
import { getErrorMessage } from '@/lib/error-utils';

export async function GET() {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                nome: true
            },
            orderBy: {
                nome: 'asc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
