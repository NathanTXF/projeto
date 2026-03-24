"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
    Users,
    HandCoins,
    TrendingUp,
    Crown,
    FileText,
    Calendar as CalendarIcon,
    LayoutDashboard,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowUpRight
} from "lucide-react";
import { KpiCard } from "@/components/layout/KpiCard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemporalContextChip } from "@/components/shared/TemporalContextChip";
import { useYearSelection } from "@/hooks/useYearSelection";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import dynamic from 'next/dynamic';
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend
} from "recharts";
import { LucideIcon } from "lucide-react";

interface CardStat {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
    bg: string;
    growth?: string;
    description?: string;
    tone?: "primary" | "emerald" | "amber" | "neutral";
}

interface DashboardStats {
    totalClients: number;
    totalClientsGrowth: string;
    activeLoans: number;
    totalCommissionsMonth: number;
    commissionsGrowth: string;
    pendingCommissions: number;
    ticketMedio: number;
    forecastVolume: number;
    metaVendasGlobal: number;
    totalSalesMonth: number;
    sellersProgress?: {
        id: string;
        name: string;
        goal: number;
        sales: number;
        percentage: number;
    }[];
}

interface TopSeller {
    id: string;
    nome: string;
    vendas: number;
    fotoUrl?: string;
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6"];

export default function OverviewPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
    const [clientsBySex, setClientsBySex] = useState<{ name: string, value: number }[]>([]);
    const [loansByMonth, setLoansByMonth] = useState<{ name: string, total: number }[]>([]);
    const [loansByBank, setLoansByBank] = useState<{ name: string, value: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const {
        selectedYear,
        setSelectedYear,
        yearOptions,
    } = useYearSelection({
        availableYears,
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isMounted) {
            const timer = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMounted]);

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

    const selectedMonthLabel = months.find((month) => month.value === selectedMonth)?.label ?? selectedMonth;
    const activeCompetenciaLabel = `${selectedMonthLabel} de ${selectedYear}`;

    useEffect(() => {
        fetchStats(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    const fetchStats = async (year: string, month: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/stats?year=${year}&month=${month}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setStats(data.stats);
            setTopSellers(data.topSellers);
            setClientsBySex(data.clientsBySex);
            setLoansByMonth(data.loansByMonth);
            setLoansByBank(data.loansByBank);
            if (data.availableYears) setAvailableYears(data.availableYears);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro ao carregar estatísticas: " + message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const dashboardCards: CardStat[] = [
        {
            icon: Users,
            label: "Total de Clientes",
            value: stats?.totalClients ?? 0,
            color: "text-primary",
            bg: "bg-primary/10",
            growth: stats?.totalClientsGrowth,
            description: "Base total de cadastros",
            tone: "primary"
        },
        {
            icon: TrendingUp,
            label: "Comissões Mês",
            value: formatCurrency(stats?.totalCommissionsMonth ?? 0),
            color: "text-primary",
            bg: "bg-primary/10",
            growth: stats?.commissionsGrowth,
            description: "Receitado no período",
            tone: "emerald"
        },
        {
            icon: Target,
            label: "Ticket Médio",
            value: formatCurrency(stats?.ticketMedio ?? 0),
            color: "text-primary",
            bg: "bg-primary/10",
            description: "Valor médio por contrato",
            tone: "neutral"
        },
        {
            icon: BarChart3,
            label: "Projeção Mensal",
            value: formatCurrency(stats?.forecastVolume ?? 0),
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            description: "Estimativa de fechamento",
            tone: "amber"
        },
    ];

    return (
        <div className="space-y-7 animate-in fade-in duration-700 pb-12">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0A2F52] to-[#05325E] p-6 md:p-10 shadow-[0_22px_60px_rgba(5,50,94,0.28)] border border-white/10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-primary/15 blur-[90px]" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                            <LayoutDashboard className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tighter text-white mb-1">Painel Estratégico</h1>
                            <div className="flex flex-wrap items-center gap-2 text-white/70 font-medium">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Performance de</span>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="field-hero w-[130px] h-7 text-xs px-2">
                                        <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-active">
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={m.value} className="rounded-lg text-xs">{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>de</span>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="field-hero w-[90px] h-7 text-xs px-2">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-active">
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={String(year)} className="rounded-lg text-xs">
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <TemporalContextChip
                                key={`${selectedMonth}-${selectedYear}`}
                                label="Competência ativa"
                                value={activeCompetenciaLabel}
                                icon={CalendarIcon}
                                tone="competencia"
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-3 px-6 min-w-[140px] shadow-md">
                            <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mb-1">Contratos Ativos</p>
                            <p className="text-2xl font-semibold text-white">{stats?.activeLoans ?? 0}</p>
                        </div>
                        <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-3 px-6 min-w-[220px] shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest">Meta Global</p>
                                <span className="text-[10px] font-medium text-amber-400">{Math.round(((stats?.totalSalesMonth || 0) / (stats?.metaVendasGlobal || 1)) * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-xl font-semibold text-white">{stats?.totalSalesMonth ?? 0}<span className="text-xs text-white/30 ml-1 font-medium">/ {stats?.metaVendasGlobal ?? 0}</span></p>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                        style={{ width: `${Math.min(100, ((stats?.totalSalesMonth || 0) / (stats?.metaVendasGlobal || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div key={`${selectedMonth}-${selectedYear}`} className="period-transition-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((stat) => (
                    <KpiCard
                        key={stat.label}
                        title={stat.label}
                        value={loading ? "..." : stat.value}
                        icon={stat.icon}
                        tone={stat.tone}
                        subtitle={stat.growth ? `${Number(stat.growth) >= 0 ? "+" : "-"}${Math.abs(Number(stat.growth))}% vs. período` : stat.description}
                    />
                ))}
            </div>

            {/* ── Performance por Consultor (Senior Update) ── */}
            {stats?.sellersProgress && (
                <Card className="rounded-xl border border-border/70 shadow-md bg-card p-5 md:p-7 overflow-hidden relative">
                    <CardHeader className="px-0 pt-0 pb-5 md:pb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-[1.95rem] md:text-[2.15rem] font-semibold tracking-tighter">Performance por Consultor</CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium text-sm md:text-[0.95rem]">Acompanhamento em tempo real do atingimento de metas individuais.</CardDescription>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <Badge className="bg-primary/8 text-primary border border-primary/15 font-medium px-3 py-1.5 rounded-md text-[11px]">
                                    Meta: Contratos Liquidados
                                </Badge>
                                <div className="h-9 w-9 rounded-full border border-primary/20 flex items-center justify-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary/45" />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        {stats.sellersProgress.map((seller) => (
                            <div key={seller.id} className="group p-4 rounded-xl bg-background border border-border/70 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center font-semibold text-lg text-primary group-hover:bg-primary/10 transition-all duration-300">
                                            {seller.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xl text-foreground tracking-tight leading-tight">{seller.name}</p>
                                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.14em] mt-1">
                                                {seller.sales} <span className="text-[10px] opacity-70">/ {seller.goal} contratos</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "h-14 min-w-14 px-2 rounded-lg flex flex-col items-center justify-center font-semibold border",
                                        seller.percentage >= 100 ? "bg-emerald-500/8 text-emerald-700 border-emerald-500/20" :
                                            seller.percentage >= 50 ? "bg-amber-500/8 text-amber-700 border-amber-500/20" :
                                                "bg-rose-500/8 text-rose-700 border-rose-500/20"
                                    )}>
                                        <span className="text-[1.05rem] leading-none">{seller.percentage.toFixed(0)}%</span>
                                        <span className="text-[9px] uppercase mt-1 opacity-65 tracking-[0.08em]">Alvo</span>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="h-2.5 w-full bg-muted/70 rounded-full p-0.5 overflow-hidden border border-border/40">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                seller.percentage >= 100 ? "bg-emerald-500" :
                                                    seller.percentage >= 50 ? "bg-amber-500" :
                                                        "bg-rose-500"
                                            )}
                                            style={{ width: `${Math.min(100, seller.percentage)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 px-0.5">
                                        <span>Início</span>
                                        <span>Meta Alcançada</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Performance por Banco (Senior) */}
                <Card className="lg:col-span-2 rounded-xl border border-border/70 shadow-md bg-card p-5 md:p-6">
                    <CardHeader className="px-0 pt-0 pb-5 md:pb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-[1.8rem] font-semibold tracking-tight text-foreground">Performance por Banco</CardTitle>
                                <CardDescription>Ranking de volume de crédito bruto liquidado.</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-md px-3 border-primary/20 text-primary font-medium text-[11px]">Mês Atual</Badge>
                        </div>
                    </CardHeader>
                    <div className="h-[350px] w-full min-w-0 relative rounded-lg border border-border/60 bg-muted/10 p-2">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/50 backdrop-blur-[2px] rounded-lg">
                                <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-2">Processando dados sênior...</span>
                            </div>
                        )}
                        <ResponsiveContainer id="overview-banks" width="100%" height={350} debounce={50} minWidth={0}>
                            <BarChart data={loansByBank} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}
                                    width={100}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.32 }}
                                    contentStyle={{ borderRadius: '0.75rem', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 16px -6px rgb(0 0 0 / 0.12)' }}
                                    formatter={(val: number | string | readonly (number | string)[] | undefined) => {
                                        const normalized = Array.isArray(val) ? val[0] : val;
                                        return formatCurrency(Number(normalized ?? 0));
                                    }}
                                />
                                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 8, 8, 0]} barSize={32}>
                                    {loansByBank.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Perfil de Clientes (Sexo) - MVP Requirement */}
                <Card className="rounded-xl border border-border/70 shadow-lg bg-card p-6 md:p-7 group">
                    <CardHeader className="px-0 pt-0 pb-4 text-center">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                            <PieChartIcon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-foreground">Perfil: Sexo</CardTitle>
                        <CardDescription>Distribuição da base de clientes.</CardDescription>
                    </CardHeader>
                    <div className="h-[250px] w-full min-w-0 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-[1px] rounded-lg">
                                <div className="h-6 w-6 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            </div>
                        )}
                        <ResponsiveContainer id="overview-sex" width="100%" height={250} debounce={50} minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={clientsBySex}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell key="cell-male" fill="#00355E" />
                                    <Cell key="cell-female" fill="#E11D48" />
                                </Pie>
                                <ChartTooltip
                                    contentStyle={{ borderRadius: '1rem', background: 'var(--card)', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Vendedores Segmentado */}
                <Card className="rounded-xl border border-border/70 shadow-md bg-card overflow-hidden">
                    <CardHeader className="bg-primary/3 border-b border-border/50 p-5">
                        <CardTitle className="text-[1.15rem] font-semibold flex items-center gap-2 text-foreground tracking-tight">
                            <Crown className="h-5 w-5 text-amber-500" />
                            Elite de Vendas
                        </CardTitle>
                        <CardDescription>Principais colaboradores do período.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {loading ? (
                                <div className="p-12 text-center text-muted-foreground">Carregando ranking...</div>
                            ) : topSellers.map((seller, index) => (
                                <Link key={seller.id} href={`/dashboard/clients?vendedorId=${seller.id}`}>
                                    <div className="px-4 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="h-11 w-11 rounded-full border border-border/60 shadow-sm overflow-hidden bg-primary/10">
                                                    {seller.fotoUrl ? (
                                                        <Image
                                                            src={seller.fotoUrl}
                                                            alt={seller.nome}
                                                            width={44}
                                                            height={44}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-primary font-medium text-sm">
                                                            {seller.nome.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                {index < 3 && (
                                                    <div className={`absolute -top-1 -right-1 h-5.5 w-5.5 rounded-full flex items-center justify-center text-[9px] text-white font-medium border border-white/80 shadow-sm
                                                        ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground text-[15px] tracking-tight group-hover:text-primary transition-colors">{seller.nome}</h4>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.12em]">{seller.vendas} contratos fechados</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            <Badge className="bg-primary/10 text-primary border border-primary/20 font-medium text-[9px] mt-1">Ver Clientes</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Histórico Consolidado */}
                <Card className="lg:col-span-2 rounded-xl border border-border/70 shadow-lg bg-card p-6 md:p-7">
                    <CardHeader className="px-0 pt-0 pb-6 md:pb-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-semibold text-foreground">Histórico Consolidado</CardTitle>
                                <CardDescription>Consistência de novos clientes nos últimos 12 meses.</CardDescription>
                            </div>
                            <PieChartIcon className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <div className="h-[250px] w-full min-w-0 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-[1px] rounded-lg">
                                <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}
                        <ResponsiveContainer id="overview-consolidated" width="100%" height={250} debounce={50} minWidth={0}>
                            <AreaChart data={loansByMonth} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700 }} />
                                <ChartTooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorLoan)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Atalhos Rápidos Corporativos */}
                <Card className="lg:col-span-3 rounded-xl border border-primary/20 shadow-lg bg-primary text-primary-foreground p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                        <TrendingUp className="h-64 w-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-3 max-w-xl text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter leading-none">Otimize a Operação</h2>
                            <p className="text-primary-foreground/75 font-medium text-base md:text-lg">
                                &quot;O sucesso é a soma de pequenos esforços repetidos dia após dia.&quot; - Transforme dados em decisões agora.
                            </p>
                            <div className="flex gap-4 justify-center md:justify-start">
                                <Link href="/dashboard/admin/goals">
                                    <Button className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl px-8 h-12 shadow-lg">Configurar Metas</Button>
                                </Link>
                                <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm justify-center rounded-lg">Alpha 1.2</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            {[
                                { icon: HandCoins, label: "Financeiro", href: "/dashboard/financial" },
                                { icon: Users, label: "Clientes", href: "/dashboard/clients" },
                                { icon: FileText, label: "Comissões", href: "/dashboard/commissions" },
                                { icon: CalendarIcon, label: "Agenda", href: "/dashboard/agenda" }
                            ].map((action) => (
                                <Link key={action.label} href={action.href}>
                                    <div className="bg-[#00355E] hover:bg-[#00355E]/90 backdrop-blur-xl p-8 rounded-xl flex flex-col items-center gap-4 transition-all cursor-pointer active:scale-95 border border-white/10 shadow-lg min-w-[140px]">
                                        <div className="bg-white/10 p-4 rounded-xl">
                                            <action.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-xs font-medium tracking-widest uppercase">{action.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
