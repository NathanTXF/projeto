"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
    Users,
    HandCoins,
    TrendingUp,
    AlertCircle,
    TrendingDown,
    Crown,
    FileText,
    Calendar as CalendarIcon,
    Plus,
    LayoutDashboard,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { generateYearRange, getCurrentYear } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface CardStat {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bg: string;
    growth?: string;
    description?: string;
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
    const [loansByType, setLoansByType] = useState<{ name: string, value: number }[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

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
            setLoansByType(data.loansByType);
            if (data.availableYears) setAvailableYears(data.availableYears);
        } catch (error: any) {
            toast.error("Erro ao carregar estatísticas: " + error.message);
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
            description: "Base total de cadastros"
        },
        {
            icon: TrendingUp,
            label: "Comissões Mês",
            value: formatCurrency(stats?.totalCommissionsMonth ?? 0),
            color: "text-primary",
            bg: "bg-primary/10",
            growth: stats?.commissionsGrowth,
            description: "Receitado no período"
        },
        {
            icon: Target,
            label: "Ticket Médio",
            value: formatCurrency(stats?.ticketMedio ?? 0),
            color: "text-primary",
            bg: "bg-primary/10",
            description: "Valor médio por contrato"
        },
        {
            icon: BarChart3,
            label: "Projeção Mensal",
            value: formatCurrency(stats?.forecastVolume ?? 0),
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            description: "Estimativa de fechamento"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-3xl bg-[#00355E] p-10 shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                            <LayoutDashboard className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-white mb-1">Painel Estratégico</h1>
                            <div className="flex flex-wrap items-center gap-2 text-white/70 font-medium">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Performance de</span>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-[130px] h-7 bg-white/10 border-white/20 text-white rounded-lg focus:ring-0 text-xs px-2 hover:bg-white/20 transition-all">
                                        <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-active">
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={m.value} className="rounded-lg text-xs">{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>de</span>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[90px] h-7 bg-white/10 border-white/20 text-white rounded-lg focus:ring-0 text-xs px-2 hover:bg-white/20 transition-all">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-active">
                                        {(availableYears.length > 0 ? availableYears : [getCurrentYear()]).map(y => (
                                            <SelectItem key={y} value={y.toString()} className="rounded-lg text-xs">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-6 min-w-[140px] shadow-lg">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Contratos Ativos</p>
                            <p className="text-2xl font-black text-white">{stats?.activeLoans ?? 0}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-6 min-w-[220px] shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Meta Global</p>
                                <span className="text-[10px] font-black text-amber-400">{Math.round(((stats?.totalSalesMonth || 0) / (stats?.metaVendasGlobal || 1)) * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-xl font-black text-white">{stats?.totalSalesMonth ?? 0}<span className="text-xs text-white/30 ml-1 font-medium">/ {stats?.metaVendasGlobal ?? 0}</span></p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-card rounded-3xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            {stat.growth && (
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black",
                                    Number(stat.growth) >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                                )}>
                                    {Number(stat.growth) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(Number(stat.growth))}%
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                {stat.label}
                            </p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">
                                {loading ? "..." : stat.value}
                            </h3>
                            <p className="text-[11px] text-muted-foreground/60 font-medium">
                                {stat.description}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Performance por Consultor (Senior Update) ── */}
            {stats?.sellersProgress && (
                <Card className="border-none shadow-2xl rounded-[32px] bg-card p-10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <CardHeader className="px-0 pt-0 pb-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Users className="h-7 w-7 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-black tracking-tighter">Performance por Consultor</CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium text-base">Acompanhamento em tempo real do atingimento de metas individuais.</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-primary/5 text-primary border-none font-black px-4 py-2 rounded-xl text-xs">Meta: Contratos Liquidados</Badge>
                                <div className="h-10 w-10 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse">
                                    <div className="h-3 w-3 rounded-full bg-primary" />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {stats.sellersProgress.map((seller) => (
                            <div key={seller.id} className="group p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-card shadow-lg flex items-center justify-center font-black text-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            {seller.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-foreground tracking-tight">{seller.name}</p>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                                {seller.sales} <span className="text-[10px] opacity-60">/ {seller.goal} contratos</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner",
                                        seller.percentage >= 100 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                            seller.percentage >= 50 ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                    )}>
                                        <span className="text-base leading-none">{seller.percentage.toFixed(0)}%</span>
                                        <span className="text-[8px] uppercase mt-1 opacity-60">Alvo</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-muted rounded-full p-0.5 overflow-hidden shadow-inner border border-white/5">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                                seller.percentage >= 100 ? "bg-emerald-500" :
                                                    seller.percentage >= 50 ? "bg-amber-500" :
                                                        "bg-rose-500"
                                            )}
                                            style={{ width: `${Math.min(100, seller.percentage)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">
                                        <span>Início</span>
                                        <span>Meta Alcançada</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Performance por Banco (Senior) */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-2xl bg-card p-8">
                    <CardHeader className="px-0 pt-0 pb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-black text-foreground">Performance por Banco</CardTitle>
                                <CardDescription>Ranking de volume de crédito bruto liquidado.</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary font-bold">Mês Atual</Badge>
                        </div>
                    </CardHeader>
                    <div className="h-[350px] w-full min-w-0 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/50 backdrop-blur-[2px] rounded-xl">
                                <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Processando dados sênior...</span>
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
                                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '1rem', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: any) => formatCurrency(Number(val))}
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
                <Card className="border-none shadow-xl rounded-2xl bg-card p-8 group">
                    <CardHeader className="px-0 pt-0 pb-4 text-center">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
                            <PieChartIcon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-black text-foreground">Perfil: Sexo</CardTitle>
                        <CardDescription>Distribuição da base de clientes.</CardDescription>
                    </CardHeader>
                    <div className="h-[250px] w-full min-w-0 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-[1px] rounded-xl">
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
                <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-border/50 p-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <Crown className="h-6 w-6 text-amber-500" />
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
                                    <div className="p-5 flex items-center justify-between hover:bg-muted/30 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-primary/10">
                                                    {seller.fotoUrl ? (
                                                        <img src={seller.fotoUrl} alt={seller.nome} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-primary font-black text-sm">
                                                            {seller.nome.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                {index < 3 && (
                                                    <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-white shadow-sm
                                                        ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">{seller.nome}</h4>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{seller.vendas} contratos fechados</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] mt-1">Ver Clientes</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Histórico Consolidado */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-2xl bg-card p-8">
                    <CardHeader className="px-0 pt-0 pb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-foreground">Histórico Consolidado</CardTitle>
                                <CardDescription>Consistência de novos clientes nos últimos 12 meses.</CardDescription>
                            </div>
                            <PieChartIcon className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <div className="h-[250px] w-full min-w-0 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-[1px] rounded-xl">
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
                <Card className="lg:col-span-3 border-none shadow-2xl rounded-3xl bg-primary text-primary-foreground p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                        <TrendingUp className="h-64 w-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            <h2 className="text-3xl font-black tracking-tighter leading-none">Otimize a Operação</h2>
                            <p className="text-primary-foreground/70 font-medium text-lg italic">
                                "O sucesso é a soma de pequenos esforços repetidos dia após dia." - Transforme dados em decisões agora.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/dashboard/admin/goals">
                                    <Button className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl px-8 h-12 shadow-xl">Configurar Metas</Button>
                                </Link>
                                <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm justify-center rounded-xl">Alpha 1.2</Badge>
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
                                    <div className="bg-[#00355E] hover:bg-[#00355E]/90 backdrop-blur-xl p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all cursor-pointer active:scale-95 border border-white/5 shadow-2xl min-w-[140px]">
                                        <div className="bg-white/10 p-4 rounded-2xl">
                                            <action.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-xs font-black tracking-widest uppercase">{action.label}</span>
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
