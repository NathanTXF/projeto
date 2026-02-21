"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, HandCoins, TrendingUp, AlertCircle, TrendingDown, Crown } from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
    totalClients: number;
    activeLoans: number;
    totalCommissionsMonth: number;
    pendingCommissions: number;
}

interface TopSeller {
    id: string;
    nome: string;
    vendas: number;
}

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
            color: "text-blue-600",
            bg: "bg-blue-50",
            growth: stats?.totalClientsGrowth
        },
        { icon: HandCoins, label: "Contratos Ativos", value: stats?.activeLoans ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: TrendingUp, label: "Comissões Mês", value: formatCurrency(stats?.totalCommissionsMonth ?? 0), color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: AlertCircle, label: "Comissões Pendentes", value: stats?.pendingCommissions ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Análise de desempenho e métricas operacionais.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 px-3 py-1 text-slate-500 font-semibold gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sistema Ativo
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white rounded-3xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{loading ? "..." : stat.value}</span>
                                {stat.growth && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
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
                <Card className="lg:col-span-2 border-none shadow-xl rounded-2xl bg-white p-6">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">Registros por Mês</CardTitle>
                                <CardDescription>Volume de empréstimos no ano atual.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">Carregando dados...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={loansByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
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
                <Card className="border-none shadow-xl rounded-2xl bg-white p-6">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-xl font-bold text-slate-800">Clientes por Sexo</CardTitle>
                        <CardDescription>Perfil demográfico da base.</CardDescription>
                    </CardHeader>
                    <div className="h-[250px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">Carregando...</div>
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
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-2">
                                    {clientsBySex.map((item, index) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-xs font-bold text-slate-600">{item.name}: {item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Atalhos Rápidos */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="h-48 w-48" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div>
                            <CardTitle className="text-2xl font-black">Acesso Rápido</CardTitle>
                            <CardDescription className="text-indigo-100/70 font-medium">Inicie novas operações com um clique.</CardDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: HandCoins, label: "Simular", href: "/dashboard/loans" },
                                { icon: Users, label: "Novo Cliente", href: "/dashboard/clients" },
                                { icon: FileText, label: "Comissões", href: "/dashboard/commissions" },
                                { icon: CalendarIcon, label: "Agenda", href: "/dashboard/agenda" }
                            ].map((action) => (
                                <Link key={action.label} href={action.href}>
                                    <div className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer active:scale-95 border border-white/10">
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
