"use client";

import { useState, useEffect } from "react";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { AnalyticalTable } from "./components/AnalyticalTable";
import type { Column } from "./components/AnalyticalTable";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    FileText,
    Search,
    Filter,
    TrendingUp,
    DollarSign,
    Users,
    Wallet,
    Calendar,
    Landmark,
    Briefcase,
    LayoutGrid,
    TableProperties,
    Layers,
    UserCircle,
    CheckCircle,
    PieChart,
} from "lucide-react";
import { Target as LucideTarget } from "lucide-react";
import { format } from "date-fns";
import { KpiCard } from "@/components/layout/KpiCard";
import { TemporalContextChip } from "@/components/shared/TemporalContextChip";
import { useYearSelection } from "@/hooks/useYearSelection";

const REPORT_TYPES = [
    { id: 'SALES', label: 'Vendas Analítico', icon: TrendingUp, color: 'indigo', description: 'Listagem detalhada de todos os contratos e status.' },
    { id: 'COMMISSIONS', label: 'Comissões Detalhado', icon: DollarSign, color: 'emerald', description: 'Extrato de comissões calculadas por vendedor.' },
    { id: 'FINANCIAL', label: 'Fluxo Financeiro', icon: Wallet, color: 'amber', description: 'Movimentação de pagamentos e liquidez.' },
    { id: 'PERFORMANCE', label: 'Performance / Metas', icon: TrendingUp, color: 'violet', description: 'Atingimento de metas vs realizado por equipe.' },
    { id: 'CUSTOMERS', label: 'Carteira de Clientes', icon: Users, color: 'pink', description: 'Análise de retenção e novos cadastros.' },
    { id: 'BANKS', label: 'Produção por Banco', icon: Landmark, color: 'blue', description: 'Volume de vendas agrupado por instituição financeira.' },
    { id: 'ORGANS', label: 'Produção por Órgão', icon: Briefcase, color: 'orange', description: 'Distribuição de vendas por convênio/órgão.' },
    { id: 'GROUPS', label: 'Produção por Grupo', icon: LayoutGrid, color: 'cyan', description: 'Agrupamento por categoria de empréstimo.' },
    { id: 'TABLES', label: 'Produção por Tabela', icon: TableProperties, color: 'slate', description: 'Desempenho por coeficiente de tabela.' },
    { id: 'LOAN_TYPES', label: 'Produção por Produto', icon: Layers, color: 'rose', description: 'Vendas por tipo de operação (Refin, Novo, etc).' },
    { id: 'OPERATORS', label: 'Produção por Operador', icon: UserCircle, color: 'teal', description: 'Ranking de vendas por usuário do sistema.' },
    { id: 'GOALS_GENERAL', label: 'Relatório Geral de Metas', icon: LucideTarget, color: 'sky', description: 'Visão mensal consolidada de metas vs. contratos realizados.' },
    { id: 'GOALS_INDIVIDUAL', label: 'Relatório Individual de Metas', icon: Users, color: 'orange', description: 'Desempenho mensal detalhado de metas por vendedor.' },
];

interface ReportSummary {
    totalItems?: number;
    totalValue?: number;
    totalLiquido?: number;
    avgPerformance?: number;
}

interface ReportResponse {
    summary?: ReportSummary;
    items?: unknown[];
}

interface SellerOption {
    id: string;
    nome: string;
    nivelAcesso: number;
    role?: {
        name?: string;
    };
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState<string>('SALES');
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-01'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState<ReportResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [sellers, setSellers] = useState<SellerOption[]>([]);
    const [selectedSeller, setSelectedSeller] = useState<string>('all');
    
    // Novo estado para sincronizar com o padrão do Painel Estratégico
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const {
        selectedYear,
        setSelectedYear,
        yearOptions,
    } = useYearSelection();

    const months = [
        { value: "1", label: "Janeiro" },
        { value: "2", label: "Fevereiro" },
        { value: "3", label: "Março" },
        { value: "4", label: "Abril" },
        { value: "5", label: "Maio" },
        { value: "6", label: "Junho" },
        { value: "7", label: "Julho" },
        { value: "8", label: "Agosto" },
        { value: "9", label: "Setembro" },
        { value: "10", label: "Outubro" },
        { value: "11", label: "Novembro" },
        { value: "12", label: "Dezembro" },
    ];

    // Sincroniza as datas (startDate/endDate) quando o mês ou ano muda
    useEffect(() => {
        const monthInt = parseInt(selectedMonth, 10);
        const yearInt = parseInt(selectedYear, 10);
        
        // Primeiro dia do mês
        const start = new Date(yearInt, monthInt - 1, 1);
        // Último dia do mês
        const end = new Date(yearInt, monthInt, 0);

        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
    }, [selectedMonth, selectedYear]);

    const formatSafeDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return format(new Date(year, month - 1, day), 'dd/MM/yyyy');
    };

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then((users: unknown) => {
                if (Array.isArray(users)) {
                    const sellerCandidates = users as SellerOption[];
                    setSellers(sellerCandidates.filter((user) => user.role?.name?.toLowerCase().includes('vendedor') || user.nivelAcesso > 1));
                }
            })
            .catch(console.error);
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: reportType,
                startDate,
                endDate,
            });
            if (selectedSeller !== 'all') params.append('sellerId', selectedSeller);

            const res = await fetch(`/api/reports?${params.toString()}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Fetch report error:', error);
        } finally {
            setLoading(false);
        }
    };

    const isCategorical = ['BANKS', 'ORGANS', 'GROUPS', 'TABLES', 'LOAN_TYPES', 'OPERATORS'].includes(reportType);

    const getColumns = () => {
        if (isCategorical) {
            return [
                { header: 'CATEGORIA', accessorKey: 'categoria' },
                { header: 'QTD VENDAS', accessorKey: 'qtdVendas' },
                { header: 'VALOR BRUTO', accessorKey: 'valorBruto', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                { header: 'VALOR LÍQUIDO', accessorKey: 'valorLiquido', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            ];
        }

        switch (reportType) {
            case 'SALES':
                return [
                    { header: 'DATA', accessorKey: 'data', format: (v: string) => format(new Date(v), 'dd/MM/yyyy') },
                    { header: 'CLIENTE', accessorKey: 'cliente' },
                    { header: 'VENDEDOR', accessorKey: 'vendedor' },
                    { header: 'BANCO', accessorKey: 'banco' },
                    { header: 'PARCELA', accessorKey: 'valorParcela', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: 'V. LÍQUIDO', accessorKey: 'valorLiquido', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: 'V. BRUTO', accessorKey: 'valorBruto', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    {
                        header: 'STATUS', accessorKey: 'status', format: (v: string) => (
                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${v === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                {v}
                            </span>
                        )
                    },
                ];
            case 'COMMISSIONS':
                return [
                    { header: 'DATA', accessorKey: 'data', format: (v: string) => format(new Date(v), 'dd/MM/yyyy') },
                    { header: 'VENDEDOR', accessorKey: 'vendedor' },
                    { header: 'CLIENTE', accessorKey: 'cliente' },
                    { header: 'V. BRUTO', accessorKey: 'valorBruto', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: '%', accessorKey: 'percentual', format: (v: number) => `${v}%` },
                    { header: 'COMISSÃO', accessorKey: 'valorComissao', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: 'STATUS', accessorKey: 'status' },
                ];
            case 'FINANCIAL':
                return [
                    { header: 'DATA', accessorKey: 'data', format: (v: string) => format(new Date(v), 'dd/MM/yyyy') },
                    { header: 'DESCRIÇÃO', accessorKey: 'descricao' },
                    { header: 'VENDEDOR', accessorKey: 'vendedor' },
                    { header: 'VALOR', accessorKey: 'valor', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: 'TIPO', accessorKey: 'tipo' },
                    { header: 'STATUS', accessorKey: 'status' },
                ];
            case 'PERFORMANCE':
                return [
                    { header: 'VENDEDOR', accessorKey: 'vendedor' },
                    { header: 'META', accessorKey: 'meta', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    { header: 'REALIZADO', accessorKey: 'realizado', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    {
                        header: 'ATINGIMENTO', accessorKey: 'percentual', format: (v: number) => (
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(v, 100)}%` }} />
                                </div>
                                <span>{v.toFixed(1)}%</span>
                            </div>
                        )
                    },
                    { header: 'QTD VENDAS', accessorKey: 'quantidadeVendas' },
                ];
            case 'CUSTOMERS':
                return [
                    { header: 'DATA CADASTRO', accessorKey: 'dataCadastro', format: (v: string) => format(new Date(v), 'dd/MM/yyyy') },
                    { header: 'NOME', accessorKey: 'nome' },
                    { header: 'CPF', accessorKey: 'cpf' },
                    { header: 'TELEFONE', accessorKey: 'telefone' },
                    { header: 'QTD CONTRATOS', accessorKey: 'qtdEmprestimos' },
                    { header: 'TOTAL BRUTO', accessorKey: 'valorTotalBruto', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                    {
                        header: 'TIPO', accessorKey: 'status', format: (v: string) => (
                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${v === 'RECORRENTE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {v}
                            </span>
                        )
                    },
                ];
            case 'GOALS_GENERAL':
            case 'GOALS_INDIVIDUAL':
                return [
                    { header: 'MÊS', accessorKey: 'mes' },
                    { header: 'META (CONTRATOS)', accessorKey: 'meta' },
                    { header: 'REALIZADO', accessorKey: 'realizado' },
                    {
                        header: 'ATINGIMENTO', accessorKey: 'percentual', format: (v: number) => (
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${v >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(v, 100)}%` }} />
                                </div>
                                <span className="font-semibold">{v.toFixed(1)}%</span>
                            </div>
                        )
                    },
                ];
            default: return [];
        }
    };

    const currentPeriod = `${formatSafeDate(startDate)} até ${formatSafeDate(endDate)}`;
    const activeReport = REPORT_TYPES.find(r => r.id === reportType);
    
    // Label de competência baseada nos selects de mês/ano
    const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || selectedMonth;
    const selectedCompetenciaLabel = `${selectedMonthLabel} de ${selectedYear}`;
    
    const summary = data?.summary || {};
    const totalItems = summary.totalItems ?? 0;
    const totalValue = summary.totalValue ?? 0;
    const totalLiquido = summary.totalLiquido ?? 0;
    const efficiency = reportType === 'PERFORMANCE' ? summary.avgPerformance ?? 0 : 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0A2F52] to-[#05325E] p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(5,50,94,0.28)] border border-white/10 print:hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/15 blur-[90px]" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 text-center sm:text-left justify-center sm:justify-start">
                        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                            <PieChart className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                                Inteligência & Relatórios
                            </h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-xs md:text-sm">
                                Dashboards analíticos e documentos para gestão de alta performance.
                            </p>
                            <TemporalContextChip
                                key={selectedCompetenciaLabel}
                                label="Competência ativa"
                                value={selectedCompetenciaLabel}
                                icon={Calendar}
                                tone="competencia"
                                className="mt-2 w-full sm:w-fit"
                            />
                        </div>
                    </div>
                </div>

                {/* Mini stats strip */}
                <div key={selectedCompetenciaLabel} className="period-transition-enter relative mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <KpiCard title="Registros" value={loading ? "..." : totalItems} icon={FileText} tone="primary" subtitle="Itens retornados" />
                    <KpiCard title="Total Bruto" value={loading ? "..." : totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon={DollarSign} tone="emerald" subtitle="Valor acumulado" />
                    <KpiCard title="Total Líquido" value={loading ? "..." : totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon={CheckCircle} tone="neutral" subtitle="Após descontos" />
                    <KpiCard title="Eficiência" value={loading ? "..." : `${efficiency.toFixed(1)}%`} icon={TrendingUp} tone="amber" subtitle={reportType === 'PERFORMANCE' ? 'Performance média' : 'Processamento ok'} />
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-none shadow-xl shadow-slate-200/50 print:hidden overflow-hidden bg-white rounded-xl">
                <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        <div className="lg:col-span-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5 space-y-4 h-fit">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Filter className="w-3 h-3" />
                                    Selecionar Relatório
                                </Label>
                                <Select value={reportType || "SALES"} onValueChange={setReportType}>
                                    <SelectTrigger className="h-12 font-semibold text-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-200 shadow-xl max-h-80">
                                        {REPORT_TYPES.map(rt => (
                                            <SelectItem key={rt.id} value={rt.id} className="font-semibold py-3 focus:bg-indigo-50 focus:text-indigo-700">
                                                <div className="flex items-center gap-2">
                                                    <rt.icon className={`w-4 h-4 text-indigo-600`} />
                                                    {rt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {activeReport && (
                                    <p className="text-xs text-slate-400 mt-2 italic px-1">
                                        {activeReport.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-8 rounded-xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 h-fit">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Mês</Label>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="h-10 font-semibold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Ano</Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="h-10 font-semibold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map(y => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Filtro por Vendedor</Label>
                                    <Select value={selectedSeller || "all"} onValueChange={setSelectedSeller}>
                                        <SelectTrigger className="h-10 font-semibold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-200 shadow-xl">
                                            <SelectItem value="all" className="font-semibold py-3 text-slate-500 italic">Global (Todos)</SelectItem>
                                            {sellers.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-semibold py-3">{s.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 lg:col-span-1 md:col-span-3">
                                    <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Período Selecionado</Label>
                                    <div className="h-10 px-3 bg-slate-50 rounded-md border border-slate-100 flex items-center text-xs font-semibold text-slate-500 truncate">
                                        {formatSafeDate(startDate)} - {formatSafeDate(endDate)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-end mt-5 md:mt-6">
                                <Button
                                    className="h-12 md:h-14 w-full md:w-auto md:px-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium uppercase text-xs tracking-[0.15em] gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    onClick={fetchReport}
                                    disabled={loading}
                                >
                                    {loading ? "Processando..." : "Gerar Relatório"}
                                    {!loading && <Search className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Print Section / Results */}
            {data ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 sm:p-6 md:p-8 bg-white border border-slate-100 rounded-2xl shadow-sm print:p-0 print:border-none print:shadow-none min-h-[500px]">
                        <ReportHeader
                            reportTitle={activeReport?.label || "Relatório"}
                            period={currentPeriod}
                        />
                        <div className="mt-8 border-t border-slate-50 pt-8">
                            <AnalyticalTable
                                title={activeReport?.label || "Relatório"}
                                columns={getColumns() as Column[]}
                                data={(data?.items as Array<Record<string, unknown>>) || []}
                            />
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/20 opacity-60">
                    <div className="h-20 w-20 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                        <Filter className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-400 uppercase tracking-widest text-sm">
                        Selecione as dimensões para visualização analítica
                    </p>
                    <p className="text-xs text-slate-300 mt-2 font-medium">Os dados serão processados e exibidos em tempo real</p>
                </div>
            )}
        </div>
    );
}
