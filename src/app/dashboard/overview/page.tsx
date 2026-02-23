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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
    ResponsiveContainer,
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
    Area
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
    metaGlobal: number;
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setStats(data.stats);
            setTopSellers(data.topSellers);
            setClientsBySex(data.clientsBySex);
            setLoansByMonth(data.loansByMonth);
            setLoansByBank(data.loansByBank);
            setLoansByType(data.loansByType);
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
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            growth: stats?.commissionsGrowth,
            description: "Receitado no período"
        },
        {
            icon: Target,
            label: "Ticket Médio",
            value: formatCurrency(stats?.ticketMedio ?? 0),
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
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
            <div className="relative overflow-hidden rounded-3xl bg-primary p-10 shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                            <LayoutDashboard className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black tracking-tighter text-white">Painel Estratégico</h1>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold uppercase tracking-widest text-[10px]">Senior BI</Badge>
                            </div>
                            <p className="text-primary-foreground/70 font-medium text-lg">Visão 360º da performance corporativa e saúde financeira.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px]">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Contratos Ativos</p>
                            <p className="text-3xl font-black text-white">{stats?.activeLoans ?? 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px]">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Pendências</p>
                            <p className="text-3xl font-black text-amber-400">{stats?.pendingCommissions ?? 0}</p>
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
                    <div className="h-[350px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Carregando inteligência de dados...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
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
                        )}
                    </div>
                </Card>

                {/* Donut: Mix de Produtos */}
                <Card className="border-none shadow-xl rounded-2xl bg-card p-8">
                    <CardHeader className="px-0 pt-0 pb-4 text-center">
                        <CardTitle className="text-xl font-black text-foreground">Mix de Produtos</CardTitle>
                        <CardDescription>Distribuição por tipo de operação.</CardDescription>
                    </CardHeader>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Analizando...</div>
                        ) : (
                            <div className="h-full flex flex-col justify-center">
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={loansByType}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {loansByType.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            contentStyle={{ borderRadius: '1rem', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-2 mt-4 px-2">
                                    {loansByType.map((item, index) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-[10px] font-black text-muted-foreground truncate">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                <div key={seller.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-all group">
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
                                            <h4 className="font-black text-foreground text-sm tracking-tight">{seller.nome}</h4>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{seller.vendas} contratos fechados</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px]">+12%</Badge>
                                    </div>
                                </div>
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
                    <div className="h-[250px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Processando histórico...</div>
                        ) : (
                            <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                                <ResponsiveContainer width="99%" height="100%">
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
                        )}
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
                                    <div className="bg-white/10 hover:bg-white/20 backdrop-blur-xl p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all cursor-pointer active:scale-95 border border-white/5 shadow-2xl min-w-[140px]">
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
