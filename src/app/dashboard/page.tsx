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

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
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
        } catch (error: any) {
            toast.error("Erro ao carregar estatísticas: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const dashboardCards = [
        { icon: Users, label: "Total de Clientes", value: stats?.totalClients ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
        { icon: HandCoins, label: "Contratos Ativos", value: stats?.activeLoans ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: TrendingUp, label: "Comissões Mês", value: formatCurrency(stats?.totalCommissionsMonth ?? 0), color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: AlertCircle, label: "Comissões Pendentes", value: stats?.pendingCommissions ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bem-vindo ao Dinheiro Fácil</h1>
                <p className="text-slate-500 mt-1">Visão geral do desempenho e métricas operacionais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon className="h-16 w-16" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-slate-500">
                                {stat.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{loading ? "..." : stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-lg rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold">Resumo Estratégico</CardTitle>
                                <CardDescription>Ações rápidas e insights.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer hover:shadow-lg transition-all active:scale-95 group">
                                <div className="flex justify-between items-start">
                                    <HandCoins className="h-8 w-8 text-blue-100 mb-4" />
                                    <TrendingUp className="h-4 w-4 text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold">Simular Empréstimo</h3>
                                <p className="text-xs text-blue-100 mt-1">Cálculo rápido de margem e parcelas.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-200 hover:bg-slate-50 transition-all active:scale-95 group">
                                <div className="flex justify-between items-start text-indigo-600">
                                    <Users className="h-8 w-8 mb-4" />
                                    <TrendingUp className="h-4 w-4 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-slate-800">Novo Cliente</h3>
                                <p className="text-xs text-slate-500 mt-1">Cadastre um novo beneficiário agora.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            Desempenho de Vendas
                        </CardTitle>
                        <CardDescription>Top 5 vendedores (volume).</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {loading ? (
                                <div className="h-48 flex items-center justify-center text-slate-400">Carregando...</div>
                            ) : topSellers.length === 0 ? (
                                <div className="h-48 flex items-center justify-center text-slate-400 italic">Nenhuma venda.</div>
                            ) : (
                                <div className="space-y-4">
                                    {topSellers.map((seller, index) => {
                                        const maxVendas = Math.max(...topSellers.map(s => s.vendas));
                                        const percentage = (seller.vendas / maxVendas) * 100;

                                        return (
                                            <div key={seller.id} className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-slate-700">{seller.nome}</span>
                                                    <span className="text-slate-900">{seller.vendas} vendas</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
