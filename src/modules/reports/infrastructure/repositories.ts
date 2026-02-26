import { prisma } from '@/lib/prisma';
import {
    ReportParams,
    ReportData,
    SalesReportItem,
    CommissionReportItem,
    FinancialReportItem,
    PerformanceReportItem
} from '../domain/entities';

export class PrismaReportRepository {
    async getSalesReport(params: ReportParams): Promise<ReportData> {
        const where: any = {
            dataInicio: {
                gte: params.startDate ? new Date(params.startDate) : undefined,
                lte: params.endDate ? new Date(params.endDate) : undefined,
            }
        };

        if (params.sellerId) where.vendedorId = params.sellerId;
        if (params.bankId) where.bancoId = Number(params.bankId);
        if (params.organId) where.orgaoId = Number(params.organId);
        if (params.status) where.status = params.status;

        const loans = await prisma.loan.findMany({
            where,
            include: {
                cliente: true,
                vendedor: true,
                orgao: true,
                banco: true,
            },
            orderBy: { dataInicio: 'desc' }
        });

        const items: SalesReportItem[] = loans.map(loan => ({
            id: loan.id,
            data: loan.dataInicio,
            cliente: loan.cliente.nome,
            cpf: loan.cliente.cpfCnpj,
            vendedor: loan.vendedor.nome,
            orgao: loan.orgao.nome,
            banco: loan.banco.nome,
            valorBruto: Number(loan.valorBruto),
            valorLiquido: Number(loan.valorLiquido),
            valorParcela: Number(loan.valorParcela),
            prazo: loan.prazo,
            status: loan.status,
        }));

        const totalValue = items.reduce((acc, curr) => acc + curr.valorBruto, 0);
        const totalLiquido = items.reduce((acc, curr) => acc + curr.valorLiquido, 0);

        return {
            summary: {
                totalItems: items.length,
                totalValue,
                totalLiquido,
            },
            items
        };
    }

    async getCommissionReport(params: ReportParams): Promise<ReportData> {
        const where: any = {
            createdAt: {
                gte: params.startDate ? new Date(params.startDate) : undefined,
                lte: params.endDate ? new Date(params.endDate) : undefined,
            }
        };

        if (params.sellerId) where.vendedorId = params.sellerId;
        if (params.status) where.status = params.status;

        const commissions = await prisma.commission.findMany({
            where,
            include: {
                vendedor: true,
                loan: {
                    include: { cliente: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const items: CommissionReportItem[] = commissions.map(c => ({
            id: c.id,
            data: c.createdAt,
            vendedor: c.vendedor.nome,
            cliente: c.loan.cliente.nome,
            valorBruto: Number(c.loan.valorBruto),
            percentual: Number(c.valorReferencia),
            valorComissao: Number(c.valorCalculado),
            status: c.status,
        }));

        const totalValue = items.reduce((acc, curr) => acc + curr.valorComissao, 0);

        return {
            summary: {
                totalItems: items.length,
                totalValue,
            },
            items
        };
    }

    async getFinancialReport(params: ReportParams): Promise<ReportData> {
        const where: any = {
            createdAt: {
                gte: params.startDate ? new Date(params.startDate) : undefined,
                lte: params.endDate ? new Date(params.endDate) : undefined,
            }
        };

        if (params.sellerId) where.vendedorId = params.sellerId;
        if (params.status) where.status = params.status;

        const financials = await prisma.financial.findMany({
            where,
            include: {
                vendedor: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const items: FinancialReportItem[] = financials.map(f => ({
            id: f.id,
            data: f.createdAt,
            descricao: `Pagamento de Comissão - ${f.mesAno}`,
            vendedor: f.vendedor.nome,
            valor: Number(f.valorTotal),
            tipo: 'SAIDA',
            status: f.status,
        }));

        const totalValue = items.reduce((acc, curr) => acc + curr.valor, 0);

        return {
            summary: {
                totalItems: items.length,
                totalValue,
            },
            items
        };
    }

    async getPerformanceReport(params: ReportParams): Promise<ReportData> {
        // Report logic for Meta vs Realizado
        const sellers = await prisma.user.findMany({
            where: {
                role: { name: { contains: 'Vendedor', mode: 'insensitive' } }
            },
            include: {
                loans: {
                    where: {
                        status: 'ATIVO',
                        dataInicio: {
                            gte: params.startDate ? new Date(params.startDate) : undefined,
                            lte: params.endDate ? new Date(params.endDate) : undefined,
                        }
                    }
                }
            }
        });

        const items: PerformanceReportItem[] = sellers.map((seller: any) => {
            const realizado = seller.loans.reduce((acc: number, curr: any) => acc + Number(curr.valorBruto), 0);
            const meta = seller.metaVendasMensal ? Number(seller.metaVendasMensal) : 0;
            const percentual = meta > 0 ? (realizado / meta) * 100 : 0;

            return {
                vendedorId: seller.id,
                vendedor: seller.nome,
                meta,
                realizado,
                percentual,
                quantidadeVendas: seller.loans.length,
            };
        });

        return {
            summary: {
                totalItems: items.length,
                avgPerformance: items.reduce((acc, curr) => acc + curr.percentual, 0) / (items.length || 1),
            },
            items
        };
    }

    async getCustomersReport(params: ReportParams): Promise<ReportData> {
        const customers = await prisma.customer.findMany({
            include: {
                loans: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const items: any[] = customers.map(c => ({
            id: c.id,
            nome: c.nome,
            cpf: c.cpfCnpj,
            telefone: c.celular,
            dataCadastro: c.createdAt,
            qtdEmprestimos: c.loans.length,
            valorTotalBruto: c.loans.reduce((acc, curr) => acc + Number(curr.valorBruto), 0),
            status: c.loans.length > 1 ? 'RECORRENTE' : 'NOVO'
        }));

        const newInPeriod = items.filter(i => {
            const start = params.startDate ? new Date(params.startDate) : new Date(0);
            const end = params.endDate ? new Date(params.endDate) : new Date();
            return i.dataCadastro >= start && i.dataCadastro <= end;
        }).length;

        return {
            summary: {
                totalItems: items.length,
                newCustomers: newInPeriod,
                recurringCustomers: items.filter(i => i.status === 'RECORRENTE').length,
            },
            items
        };
    }

    async getCategoricalReport(params: ReportParams): Promise<ReportData> {
        let groupByField = '';
        let includeRelation = '';

        switch (params.type) {
            case 'BANKS': groupByField = 'banco'; includeRelation = 'banco'; break;
            case 'ORGANS': groupByField = 'orgao'; includeRelation = 'orgao'; break;
            case 'GROUPS': groupByField = 'grupo'; includeRelation = 'grupo'; break;
            case 'TABLES': groupByField = 'tabela'; includeRelation = 'tabela'; break;
            case 'LOAN_TYPES': groupByField = 'tipo'; includeRelation = 'tipo'; break;
            case 'OPERATORS': groupByField = 'vendedor'; includeRelation = 'vendedor'; break;
            default: throw new Error('Tipo de categoria inválido');
        }

        const loans = await prisma.loan.findMany({
            where: {
                dataInicio: {
                    gte: params.startDate ? new Date(params.startDate) : undefined,
                    lte: params.endDate ? new Date(params.endDate) : undefined,
                }
            },
            include: {
                [includeRelation]: true
            }
        });

        const grouping: Record<string, any> = {};

        loans.forEach(loan => {
            const relation = (loan as any)[includeRelation];
            const key = relation?.nome || relation?.nome || 'Não Informado';

            if (!grouping[key]) {
                grouping[key] = {
                    categoria: key,
                    qtdVendas: 0,
                    valorBruto: 0,
                    valorLiquido: 0
                };
            }

            grouping[key].qtdVendas++;
            grouping[key].valorBruto += Number(loan.valorBruto);
            grouping[key].valorLiquido += Number(loan.valorLiquido);
        });

        const items = Object.values(grouping).sort((a, b) => b.valorBruto - a.valorBruto);

        return {
            summary: {
                totalItems: items.length,
                totalValue: items.reduce((acc, curr) => acc + curr.valorBruto, 0),
                totalLiquido: items.reduce((acc, curr) => acc + curr.valorLiquido, 0),
            },
            items
        };
    }

    async getGoalsReport(params: ReportParams): Promise<ReportData> {
        const year = params.startDate ? new Date(params.startDate).getFullYear() : new Date().getFullYear();

        const [goals, loans] = await Promise.all([
            prisma.goal.findMany({
                where: { ano: year, tipo: 'INDIVIDUAL' }
            }),
            prisma.loan.findMany({
                where: {
                    status: 'ATIVO',
                    dataInicio: {
                        gte: new Date(`${year}-01-01`),
                        lte: new Date(`${year}-12-31`)
                    }
                }
            })
        ]);

        const items = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthLabel = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ][i];

            const monthGoals = goals.filter(g => g.mes === month);
            const totalGoal = monthGoals.reduce((acc, curr) => acc + curr.valor, 0);

            const monthLoans = loans.filter(l => {
                const d = new Date(l.dataInicio);
                return (d.getMonth() + 1) === month;
            });

            const realizado = monthLoans.length; // Count of contracts as per user request
            const percentual = totalGoal > 0 ? (realizado / totalGoal) * 100 : 0;

            return {
                mes: monthLabel,
                meta: totalGoal,
                realizado,
                percentual
            };
        });

        return {
            summary: {
                totalItems: 12,
                totalGoal: items.reduce((acc, curr) => acc + curr.meta, 0),
                totalRealizado: items.reduce((acc, curr) => acc + curr.realizado, 0)
            },
            items
        };
    }

    async getUserGoalsReport(params: ReportParams): Promise<ReportData> {
        const year = params.startDate ? new Date(params.startDate).getFullYear() : new Date().getFullYear();
        const sellerId = params.sellerId;

        if (!sellerId) throw new Error("Vendedor não especificado");

        const [goals, loans] = await Promise.all([
            prisma.goal.findMany({
                where: { ano: year, tipo: 'INDIVIDUAL', userId: sellerId }
            }),
            prisma.loan.findMany({
                where: {
                    status: 'ATIVO',
                    vendedorId: sellerId,
                    dataInicio: {
                        gte: new Date(`${year}-01-01`),
                        lte: new Date(`${year}-12-31`)
                    }
                }
            })
        ]);

        const items = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthLabel = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ][i];

            const goal = goals.find(g => g.mes === month)?.valor || 0;

            const monthLoans = loans.filter(l => {
                const d = new Date(l.dataInicio);
                return (d.getMonth() + 1) === month;
            });

            const realizado = monthLoans.length;
            const percentual = goal > 0 ? (realizado / goal) * 100 : 0;

            return {
                mes: monthLabel,
                meta: goal,
                realizado,
                percentual
            };
        });

        return {
            summary: {
                totalItems: 12,
                totalGoal: items.reduce((acc, curr) => acc + curr.meta, 0),
                totalRealizado: items.reduce((acc, curr) => acc + curr.realizado, 0)
            },
            items
        };
    }
}
