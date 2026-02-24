import { NextResponse } from 'next/server';
import { getAuthUser } from '@/core/auth/getUser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// Force Next.js to reload Prisma schema

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        let company = await prisma.company.findFirst({ where: { id: 1 } });

        // Upsert fallback caso ainda não exista no banco
        if (!company) {
            company = await prisma.company.create({
                data: {
                    id: 1,
                    nome: "Dinheiro Fácil Ltda",
                    cnpj: "00.000.000/0001-00",
                }
            });
        }

        return NextResponse.json(company);
    } catch (error: any) {
        console.error("GET Company Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.nivelAcesso !== 1) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem editar a empresa.' }, { status: 403 });
        }

        const data = await request.json();

        const updatedCompany = await prisma.company.upsert({
            where: { id: 1 },
            update: {
                nome: data.nome,
                cnpj: data.cnpj,
                contato: data.contato,
                endereco: data.endereco,
                cidade: data.cidade,
                logoUrl: data.logoUrl
            },
            create: {
                id: 1,
                nome: data.nome,
                cnpj: data.cnpj,
                contato: data.contato,
                endereco: data.endereco,
                cidade: data.cidade,
                logoUrl: data.logoUrl
            }
        });

        return NextResponse.json(updatedCompany);
    } catch (error: any) {
        console.error("PUT Company Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
