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
    CheckCircle2,
    Circle,
    Search,
    Plus,
    FileText,
    PieChart,
    Shield,
    Wallet
} from "lucide-react";
import Link from "next/link";
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 1000);
        fetchMetrics();
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

    const toggleAppointmentStatus = async (id: string, currentStatus: string) => {
        try {
            const nextStatus = currentStatus === "PENDENTE" ? "CONCLUIDO" : "PENDENTE";
            const response = await fetch(`/api/agenda/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (response.ok) {
                // Atualizar localmente para feedback instantâneo
                setData((prev: any) => ({
                    ...prev,
                    appointments: prev.appointments.map((apt: any) =>
                        apt.id === id ? { ...apt, status: nextStatus } : apt
                    )
                }));
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sidebar" />
            </div>
        );
    }

    const { user: authUser, metrics, appointments, history, pipeline, hub } = data || {};

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const goalPercent = metrics?.metaVendasMensal ? Math.min(100, ((metrics?.totalSalesMonth || 0) / metrics.metaVendasMensal) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* ── Strategic Hero Banner ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#00355E] p-8 md:p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-sidebar/10 blur-[80px]" />

                <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black px-3 py-1 text-[10px] uppercase tracking-widest rounded-full">
                                {authUser?.nivelAcesso === 1 ? "Painel do Gestor" : "Portal de Resultados"}
                            </Badge>
                            {metrics?.rankingPosition && (
                                <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                                    <Trophy className="h-4 w-4" />
                                    <span>#{metrics.rankingPosition} no Ranking</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.1]">
                            Olá, <span className="text-primary">{authUser?.nome?.split(' ')[0]}</span>. <br />
                            Pronto para <span className="italic underline decoration-primary/30">vencer?</span>
                        </h1>
                        <p className="text-white/80 font-medium max-w-md text-lg leading-relaxed">
                            {authUser?.nivelAcesso === 1
                                ? "Seu sistema está operacional. Confira os indicadores estratégicos e tome decisões baseadas em dados."
                                : `Você já realizou ${metrics?.totalSalesMonth || 0} vendas este mês. Faltam ${Math.max(0, (metrics?.metaVendasMensal || 0) - (metrics?.totalSalesMonth || 0))} para bater sua meta!`}
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 min-w-[340px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-5">
                                <div>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{authUser?.nivelAcesso === 1 ? "Meta Global" : "Sua Meta"}</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">{Math.round(goalPercent)}%</p>
                                </div>
                                <div className="text-right">
                                    <Badge className="bg-white/10 text-white border-white/10 mb-2">{goalPercent >= 100 ? "🏆 Meta Batida!" : "Em progresso"}</Badge>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                                    style={{ width: `${goalPercent}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter mb-1">Pendentes</p>
                                    <p className="text-md font-bold text-white leading-none">{formatCurrency(metrics?.commissions.pending)}</p>
                                </div>
                                <div className="p-4 rounded-3xl bg-primary/10 border border-primary/10 hover:bg-primary/20 transition-colors">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter mb-1">Cadastros</p>
                                    <p className="text-md font-bold text-white leading-none">{metrics?.customers.month}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions Grid (The Hub) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Novo Cliente", icon: Plus, href: "/dashboard/clients", color: "text-sidebar", bg: "bg-sidebar/10" },
                    { label: "Novo Contrato", icon: FileText, href: "/dashboard/loans", color: "text-sidebar", bg: "bg-sidebar/10" },
                    { label: "Comissões", icon: PieChart, href: "/dashboard/commissions", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Financeiro", icon: Wallet, href: "/dashboard/financial", color: "text-amber-600", bg: "bg-amber-50" },
                ].map((action) => (
                    <Link key={action.label} href={action.href}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full h-auto p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:scale-[1.02] border border-slate-100 bg-white shadow-sm hover:shadow-md",
                                "hover:bg-white"
                            )}
                        >
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner", action.bg, action.color)}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{action.label}</span>
                        </Button>
                    </Link>
                ))}
            </div>

            {/* ── Admin Specific Strategic View ── */}
            {authUser?.nivelAcesso === 1 && hub && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-500 delay-150">
                    <Card className="border-none shadow-xl rounded-[2rem] bg-sidebar p-1">
                        <div className="bg-white rounded-[1.9rem] p-6 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-sidebar/10 rounded-xl flex items-center justify-center text-sidebar">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <Badge className="bg-sidebar/10 text-sidebar-foreground border-none">Gestão Global</Badge>
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Aprovação Pendente</h3>
                            <p className="text-3xl font-black text-slate-900">{hub.pendingApproval}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Comissões aguardando sua revisão.</p>
                            <Link href="/dashboard/commissions">
                                <Button variant="link" className="p-0 h-auto mt-4 text-primary font-bold text-xs gap-1 group">
                                    Acessar Comissões <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 p-1">
                        <div className="bg-white rounded-[1.9rem] p-6 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <Badge className="bg-primary/20 text-primary border-none">Fluxo de Caixa</Badge>
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Recebido</h3>
                            <p className="text-3xl font-black text-slate-900">{formatCurrency(metrics?.commissions.received || 0)}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Suas comissões pagas neste mês.</p>
                            <Link href="/dashboard/commissions">
                                <Button variant="link" className="p-0 h-auto mt-4 text-primary font-bold text-xs gap-1 group">
                                    Ver Minhas Comissões <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-500 p-1">
                        <div className="bg-white rounded-[1.9rem] p-6 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <Badge className="bg-amber-100 text-amber-700 border-none">Performance</Badge>
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Vendas do Mês</h3>
                            <p className="text-3xl font-black text-slate-900">{hub.totalLoansMonth}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Contratos gerados globalmente.</p>
                            <Link href="/dashboard/loans">
                                <Button variant="link" className="p-0 h-auto mt-4 text-amber-600 font-bold text-xs gap-1 group">
                                    Explorar Vendas <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Pipeline Section (Senior Action Grid) ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight">Pipeline de Vendas (Mês)</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Digitação", count: pipeline?.digitacao || 0, icon: ClipboardCheck, color: "text-sidebar", bg: "bg-sidebar/10" },
                        { label: "Em Análise", count: pipeline?.analise || 0, icon: Search, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Averbação", count: pipeline?.averbacao || 0, icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
                        { label: "Contratos Pagos", count: pipeline?.pagos || 0, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" }
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
                            <div style={{ width: '100%', height: '300px', position: 'relative', minWidth: 0 }}>
                                <ResponsiveContainer id="dash-evolution" width="100%" height={300} debounce={50} minWidth={0}>
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
                            </div>
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
                        <Card className="border-none shadow-xl rounded-3xl bg-primary/5 p-6 border-l-4 border-primary">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
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
                        <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                            <div className="divide-y divide-border/30">
                                {appointments?.length > 0 ? appointments.map((appointment: any) => (
                                    <div key={appointment.id} className={cn(
                                        "p-5 hover:bg-muted/30 transition-all group flex gap-4 items-start",
                                        appointment.status === "CONCLUIDO" && "opacity-60"
                                    )}>
                                        <button
                                            onClick={() => toggleAppointmentStatus(appointment.id, appointment.status)}
                                            className={cn(
                                                "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm border mt-1",
                                                appointment.status === "CONCLUIDO"
                                                    ? "bg-primary border-primary text-white"
                                                    : "bg-white border-border text-slate-300 hover:border-primary hover:text-primary"
                                            )}
                                        >
                                            {appointment.status === "CONCLUIDO" ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </button>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-primary">{appointment.hora}</span>
                                                <Badge className={cn(
                                                    "bg-muted text-muted-foreground border-none text-[8px] font-black uppercase tracking-tighter",
                                                    appointment.status === 'CONCLUIDO' && 'bg-primary/10 text-primary'
                                                )}>
                                                    {appointment.status === 'CONCLUIDO' ? 'FEITO' : appointment.tipo}
                                                </Badge>
                                            </div>
                                            <h4 className={cn(
                                                "font-bold text-sm text-foreground tracking-tight leading-tight",
                                                appointment.status === "CONCLUIDO" && "line-through"
                                            )}>
                                                {appointment.observacao || 'Sem observações'}
                                            </h4>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground">Tudo limpo por aqui!</p>
                                        <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Nada agendado para hoje</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-6 bg-muted/10 border-t border-border/40 shrink-0">
                            <Link href="/dashboard/agenda">
                                <Button variant="outline" className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest border-border/50 h-11 bg-white shadow-sm hover:shadow-md transition-all">
                                    Ver Agenda Completa
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
