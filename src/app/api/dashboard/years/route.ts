import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/core/auth/getUser";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/error-utils";

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const canViewSalesYears = hasAnyPermission(user.permissions || [], [
            PERMISSIONS.VIEW_LOANS,
            PERMISSIONS.VIEW_DASHBOARD,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.VIEW_FINANCIAL,
            PERMISSIONS.VIEW_COMMISSIONS,
        ]);

        if (!canViewSalesYears) {
            return NextResponse.json({ error: "Sem permissão para consultar anos" }, { status: 403 });
        }

        const isAdmin = user.nivelAcesso === 1;
        const where = isAdmin ? {} : { vendedorId: user.id };

        const loanDates = await prisma.loan.findMany({
            where,
            select: { dataInicio: true },
            distinct: ["dataInicio"],
            orderBy: { dataInicio: "desc" },
        });

        const years = Array.from(
            new Set(
                loanDates
                    .map((loan) => new Date(loan.dataInicio).getFullYear())
                    .filter((year) => Number.isFinite(year))
            )
        ).sort((a, b) => b - a);

        if (years.length === 0) {
            years.push(new Date().getFullYear());
        }

        return NextResponse.json({ years });
    } catch (error) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}