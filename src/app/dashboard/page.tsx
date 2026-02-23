"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, HandCoins, TrendingUp, AlertCircle, TrendingDown, Crown, FileText, Calendar as CalendarIcon, Plus, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";

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
    Cell
} from "recharts";

interface CardStat {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bg: string;
    growth?: string;
}

interface DashboardStats {
    totalClients: number;
    totalClientsGrowth: string;
    activeLoans: number;
    totalCommissionsMonth: number;
    pendingCommissions: number;
}

interface TopSeller {
    id: string;
    nome: string;
    vendas: number;
    fotoUrl?: string;
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b"];

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
    const [clientsBySex, setClientsBySex] = useState<{ name: string, value: number }[]>([]);
    const [loansByMonth, setLoansByMonth] = useState<{ name: string, total: number }[]>([]);
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
            growth: stats?.totalClientsGrowth
        },
        { icon: HandCoins, label: "Contratos Ativos", value: stats?.activeLoans ?? 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: TrendingUp, label: "Comissões Mês", value: formatCurrency(stats?.totalCommissionsMonth ?? 0), color: "text-primary", bg: "bg-primary/10" },
        { icon: AlertCircle, label: "Comissões Pendentes", value: stats?.pendingCommissions ?? 0, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2x2 bg-primary p-8 shadow-sm">
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <LayoutDashboard className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Dashboard</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Análise de desempenho e métricas operacionais do sistema.</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="w-fit bg-primary-foreground/10 border-primary-foreground/20 px-4 py-2 text-primary-foreground font-semibold gap-2 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Sistema Ativo
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((stat) => (
                    <Card key={stat.label} className="border border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-card rounded-2xl">
                        <CardHeader className="flex flex-col items-start gap-4 pb-2">
                            <div className="flex w-full items-center justify-between">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                    {stat.label}
                                </CardTitle>
                                <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-foreground tracking-tight">{loading ? "..." : stat.value}</span>
                                {stat.growth && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                                        +{stat.growth}%
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico Mensal */}
                <Card className="lg:col-span-2 border border-border shadow-sm rounded-2xl bg-card p-6">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">Registros por Mês</CardTitle>
                                <CardDescription>Volume de empréstimos no ano atual.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Carregando dados...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={loansByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: 'var(--muted)' }}
                                        contentStyle={{ borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Top Vendedores */}
                <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <Crown className="h-5 w-5 text-amber-500" />
                            Top Vendedores
                        </CardTitle>
                        <CardDescription>Pelo volume de contratos fechados.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-5">
                            {loading ? (
                                <div className="h-48 flex items-center justify-center text-slate-400">Carregando...</div>
                            ) : topSellers.map((seller, index) => (
                                <div key={seller.id} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-indigo-50">
                                                {seller.fotoUrl ? (
                                                    <img src={seller.fotoUrl} alt={seller.nome} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {seller.nome.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            {index < 3 && (
                                                <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white shadow-sm
                                                    ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-400'}`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{seller.nome}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{seller.vendas} clientes registrados</p>
                                        </div>
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Distribuição por Sexo */}
                <Card className="border border-border shadow-sm rounded-2xl bg-card p-6">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-xl font-bold text-foreground">Clientes por Sexo</CardTitle>
                        <CardDescription>Perfil demográfico da base.</CardDescription>
                    </CardHeader>
                    <div className="h-[250px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Carregando...</div>
                        ) : (
                            <div className="h-full flex flex-col justify-center">
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={clientsBySex}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {clientsBySex.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? "var(--color-primary)" : "var(--color-chart-1)"} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            contentStyle={{ borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-2">
                                    {clientsBySex.map((item, index) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: index === 0 ? "var(--primary)" : "oklch(0.65 0.2 160)" }} />
                                            <span className="text-xs font-bold text-muted-foreground">{item.name}: {item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Atalhos Rápidos */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-primary text-primary-foreground p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <TrendingUp className="h-48 w-48" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div>
                            <CardTitle className="text-2xl font-black">Acesso Rápido</CardTitle>
                            <CardDescription className="text-primary-foreground/70 font-medium">Inicie novas operações corporativas com um clique.</CardDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: HandCoins, label: "Simular", href: "/dashboard/loans" },
                                { icon: Users, label: "Novo Cliente", href: "/dashboard/clients" },
                                { icon: FileText, label: "Comissões", href: "/dashboard/commissions" },
                                { icon: CalendarIcon, label: "Agenda", href: "/dashboard/agenda" }
                            ].map((action) => (
                                <Link key={action.label} href={action.href}>
                                    <div className="bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer active:scale-95 border border-primary-foreground/10">
                                        <action.icon className="h-6 w-6" />
                                        <span className="text-xs font-bold tracking-tight">{action.label}</span>
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
