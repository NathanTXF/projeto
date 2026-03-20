import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const company = await prisma.company.findFirst({
            where: { id: 1 },
            select: {
                nome: true,
                logoUrl: true,
                reportLogoUrl: true
            }
        });

        if (!company) {
            return NextResponse.json({
                nome: "Dinheiro Fácil",
                logoUrl: null,
                reportLogoUrl: null
            });
        }

        return NextResponse.json(company);
    } catch (error: any) {
        console.error("Public Branding API Error:", error);
        return NextResponse.json({
            nome: "Dinheiro Fácil",
            logoUrl: null,
            reportLogoUrl: null
        });
    }
}
