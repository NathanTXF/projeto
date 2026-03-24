import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage } from '@/lib/error-utils';

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
    } catch (error) {
        console.error("Public Branding API Error:", error);
        const message = getErrorMessage(error);
        console.error("Public Branding API Error Message:", message);
        return NextResponse.json({
            nome: "Dinheiro Fácil",
            logoUrl: null,
            reportLogoUrl: null
        });
    }
}
