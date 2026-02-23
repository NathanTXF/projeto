"use client";

import { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    Calendar,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ChevronRight,
    Loader2,
    CalendarDays,
    Trophy,
    Activity,
    ClipboardCheck,
    AlertCircle,
    CheckCircle2,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/progress";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await fetch('/api/dashboard/me');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Erro ao carregar métricas:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { metrics, appointments, history, pipeline } = data || {};

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const goalPercent = metrics?.metaMensal ? Math.min(100, ((metrics?.commissions.received || 0) / metrics.metaMensal) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* ── Senior Personal Hero ── */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 md:p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black px-3 py-1 text-[10px] uppercase tracking-widest rounded-full">
                                Performance Hub
                            </Badge>
                            {metrics?.rankingPosition && (
                                <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                                    <Trophy className="h-4 w-4" />
                                    <span>#{metrics.rankingPosition} no Ranking Geral</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                            Vamos bater essa <br />
                            <span className="text-primary italic">meta hoje?</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-md text-lg">
                            Você já conquistou {formatCurrency(metrics?.commissions.received)} este mês. Faltam apenas {formatCurrency(Math.max(0, metrics?.metaMensal - metrics?.commissions.received))} para o seu objetivo!
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 min-w-[320px] shadow-2xl">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Mensal</p>
                                <p className="text-3xl font-black text-white">{Math.round(goalPercent)}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xs font-bold text-primary">{goalPercent >= 100 ? "🏆 Meta Batida!" : "Em progresso"}</p>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                                style={{ width: `${goalPercent}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">Pendentes</p>
                                <p className="text-sm font-bold text-white">{formatCurrency(metrics?.commissions.pending)}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/10">
                                <p className="text-[9px] font-black text-primary uppercase tracking-tighter mb-0.5">Cadastros</p>
                                <p className="text-sm font-bold text-white">{metrics?.customers.month}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Pipeline Section (Senior Action Grid) ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight">Pipeline de Vendas (Mês)</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Digitação", count: pipeline?.digitacao || 0, icon: ClipboardCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Em Análise", count: pipeline?.analise || 0, icon: Search, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { label: "Averbação", count: pipeline?.averbacao || 0, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                        { label: "Contratos Pagos", count: pipeline?.pagos || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                    ].map((step) => (
                        <Card key={step.label} className="border-none shadow-xl hover:shadow-2xl transition-all group rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("h-10 w-10 flex items-center justify-center rounded-2xl", step.bg, step.color)}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-foreground mb-1">{step.count}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{step.label}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Evolution Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-8">
                            <div>
                                <CardTitle className="text-xl font-extrabold text-foreground">Sua Evolução</CardTitle>
                                <CardDescription>Consistência de cadastros nos últimos 12 meses.</CardDescription>
                            </div>
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorHistory)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="border-none shadow-xl rounded-3xl bg-primary/5 p-6 border-l-4 border-primary">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Volume em Análise</p>
                                    <h4 className="text-xl font-black text-foreground">{formatCurrency(pipeline?.volumePendente || 0)}</h4>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-none shadow-xl rounded-3xl bg-emerald-500/5 p-6 border-l-4 border-emerald-500">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hoje</p>
                                    <h4 className="text-xl font-black text-foreground">{metrics?.customers.today} novos cadastros</h4>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Agenda Widget */}
                <div className="space-y-8 flex flex-col">
                    <Card className="border-none shadow-xl rounded-3xl bg-card overflow-hidden flex-1 flex flex-col">
                        <CardHeader className="bg-primary/5 border-b border-border/40 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-lg font-black">Agenda do Dia</CardTitle>
                                </div>
                                <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black px-2 py-0.5 text-[9px]">Hoje</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="divide-y divide-border/30">
                                {appointments?.length > 0 ? appointments.map((appointment: any) => (
                                    <div key={appointment.id} className="p-5 hover:bg-muted/30 transition-all group flex gap-4">
                                        <div className="flex flex-col items-center shrink-0">
                                            <span className="text-sm font-black text-primary">{appointment.hora}</span>
                                            <div className="w-px flex-1 bg-border/50 my-1" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-foreground tracking-tight leading-tight">{appointment.tipo}</h4>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{appointment.observacao || 'Sem observações'}</p>
                                            <div className="pt-2 flex items-center gap-2">
                                                <Badge className="bg-muted text-muted-foreground border-none text-[8px] font-black uppercase tracking-tighter">
                                                    {appointment.visibilidade}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground">Tudo limpo por aqui!</p>
                                        <p className="text-[11px] text-muted-foreground/60 mt-1">Aproveite para prospectar.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-6 bg-muted/10 border-t border-border/40 shrink-0">
                            <Button variant="outline" className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest border-border/50 h-11 bg-white shadow-sm">Ver Minha Agenda</Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
