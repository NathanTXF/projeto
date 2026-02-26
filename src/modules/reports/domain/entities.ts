import { z } from 'zod';

export const ReportTypeEnum = z.enum(['SALES', 'COMMISSIONS', 'FINANCIAL', 'PERFORMANCE', 'AUDIT', 'CUSTOMERS', 'BANKS', 'ORGANS', 'GROUPS', 'TABLES', 'LOAN_TYPES', 'OPERATORS']);
export type ReportType = z.infer<typeof ReportTypeEnum>;

export interface ReportParams {
    type: ReportType;
    startDate?: string;
    endDate?: string;
    sellerId?: string;
    bankId?: number;
    organId?: number;
    status?: string;
}

export interface SalesReportItem {
    id: string;
    data: Date;
    cliente: string;
    cpf: string;
    vendedor: string;
    orgao: string;
    banco: string;
    valorBruto: number;
    valorLiquido: number;
    valorParcela: number;
    prazo: number;
    status: string;
}

export interface CommissionReportItem {
    id: string;
    data: Date;
    vendedor: string;
    cliente: string;
    valorBruto: number;
    percentual: number;
    valorComissao: number;
    status: string;
}

export interface FinancialReportItem {
    id: string;
    data: Date;
    descricao: string;
    vendedor: string;
    valor: number;
    tipo: 'ENTRADA' | 'SAIDA';
    status: string;
}

export interface PerformanceReportItem {
    vendedorId: string;
    vendedor: string;
    meta: number;
    realizado: number;
    percentual: number;
    quantidadeVendas: number;
}

export interface CustomerReportItem {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    dataCadastro: Date;
    qtdEmprestimos: number;
    valorTotalBruto: number;
    status: 'NOVO' | 'RECORRENTE' | 'INATIVO';
}

export interface ReportData {
    summary: {
        totalItems: number;
        totalValue?: number;
        totalLiquido?: number;
        [key: string]: any;
    };
    items: any[];
}
