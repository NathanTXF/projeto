"use client";

import { useState, useEffect } from "react";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { AnalyticalTable } from "./components/AnalyticalTable";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    ArrowRight,
    Building2,
    Landmark,
    Briefcase,
    LayoutGrid,
    TableProperties,
    Layers,
    UserCircle,
    CheckCircle,
    PlusCircle,
    PieChart
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
];

export default function ReportsPage() {
    const [reportType, setReportType] = useState<string>('SALES');
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-01'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sellers, setSellers] = useState<any[]>([]);
    const [selectedSeller, setSelectedSeller] = useState<string>('all');

    const formatSafeDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return format(new Date(year, month - 1, day), 'dd/MM/yyyy');
    };

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSellers(data.filter((u: any) => u.role?.name?.toLowerCase().includes('vendedor') || u.nivelAcesso > 1));
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
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
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
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v === 'RECORRENTE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {v}
                            </span>
                        )
                    },
                ];
            default: return [];
        }
    };

    const currentPeriod = `${formatSafeDate(startDate)} até ${formatSafeDate(endDate)}`;
    const activeReport = REPORT_TYPES.find(r => r.id === reportType);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-6 md:p-8 shadow-sm print:hidden">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 text-center sm:text-left justify-center sm:justify-start">
                        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <PieChart className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                                Inteligência & Relatórios
                            </h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-xs md:text-sm">
                                Dashboards analíticos e documentos para gestão de alta performance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mini stats strip */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <FileText className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Registros</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : (data?.summary?.totalItems || 0)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <DollarSign className="h-6 w-6 text-emerald-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total Bruto</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">
                                {loading ? "..." : (data?.summary?.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <CheckCircle className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total Líquido</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">
                                {loading ? "..." : (data?.summary?.totalLiquido || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <TrendingUp className="h-6 w-6 text-amber-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Eficiência</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">
                                {loading ? "..." : reportType === 'PERFORMANCE' ? `${(data?.summary?.avgPerformance || 0).toFixed(1)}%` : '100%'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-none shadow-xl shadow-slate-200/50 print:hidden overflow-hidden bg-white rounded-2xl">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="lg:col-span-4 bg-slate-50 border-r border-slate-100 p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Filter className="w-3 h-3" />
                                    Selecionar Relatório
                                </Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-80">
                                        {REPORT_TYPES.map(rt => (
                                            <SelectItem key={rt.id} value={rt.id} className="font-bold py-3 focus:bg-indigo-50 focus:text-indigo-700">
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

                        <div className="lg:col-span-8 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Final</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro por Vendedor</Label>
                                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                            <SelectItem value="all" className="font-bold py-3 text-slate-500 italic">Global (Todos)</SelectItem>
                                            {sellers.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold py-3">{s.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-end mt-6 md:mt-8">
                                <Button
                                    className="h-12 md:h-14 w-full md:w-auto md:px-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-[0.15em] gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
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
                    <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm print:p-0 print:border-none print:shadow-none min-h-[500px]">
                        <ReportHeader
                            reportTitle={activeReport?.label || "Relatório"}
                            period={currentPeriod}
                        />
                        <div className="mt-8 border-t border-slate-50 pt-8">
                            <AnalyticalTable
                                title={activeReport?.label || "Relatório"}
                                columns={getColumns()}
                                data={data.items}
                            />
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/20 opacity-60">
                    <div className="h-20 w-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                        <Filter className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
                        Selecione as dimensões para visualização analítica
                    </p>
                    <p className="text-xs text-slate-300 mt-2 font-medium">Os dados serão processados e exibidos em tempo real</p>
                </div>
            )}
        </div>
    );
}
