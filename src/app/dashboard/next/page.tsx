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
    CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PersonalizedDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterPeriod, setFilterPeriod] = useState<'day' | 'month' | 'year'>('month');

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

    const { metrics, appointments, history } = data || {};

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Personal Hero Banner ── */}
            <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Bem-vindo de volta!</h1>
                        <p className="text-primary-foreground/80 font-medium max-w-md">
                            Aqui está o resumo da sua performance e seus próximos compromissos para hoje.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Card className="bg-white/10 border-none backdrop-blur-md shadow-inner rounded-2xl p-4 min-w-[140px]">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Cadastros Hoje</p>
                            <p className="text-3xl font-black text-white">{metrics?.customers.today}</p>
                        </Card>
                        <Card className="bg-white/20 border-none backdrop-blur-md shadow-inner rounded-2xl p-4 min-w-[140px]">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Comissões Rec.</p>
                            <p className="text-3xl font-black text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.commissions.received)}
                            </p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── Main Dashboard Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* ── Column 1 & 2: Performance Charts ── */}
                <div className="md:col-span-2 space-y-8">
                    {/* Performance Chart */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-8">
                            <div>
                                <CardTitle className="text-xl font-bold">Meu Histórico de Cadastros</CardTitle>
                                <CardDescription>Volume de clientes cadastrados nos últimos 12 meses.</CardDescription>
                            </div>
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent className="h-[350px] px-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--primary)"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Bottom Split: Commissions & Mini Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                            <CardHeader className="pb-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">A Receber</p>
                                <CardTitle className="text-3xl font-black text-amber-500">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.commissions.pending)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Pagamento previsto para o próximo ciclo</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                            <CardHeader className="pb-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cadastros no Mês</p>
                                <CardTitle className="text-3xl font-black text-primary">
                                    {metrics?.customers.month}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3" />
                                    <span>+12.5% em relação ao mês anterior</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Column 3: Agenda Widget ── */}
                <div className="md:col-span-1 space-y-8">
                    <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden flex flex-col h-full">
                        <CardHeader className="bg-primary/5 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg font-bold">Minha Agenda</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            <div className="divide-y divide-border/50">
                                {appointments?.length > 0 ? appointments.map((appointment: any) => (
                                    <div key={appointment.id} className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant={appointment.visibilidade === 'GLOBAL' ? 'secondary' : 'outline'} className="text-[9px] font-bold uppercase tracking-tighter">
                                                {appointment.visibilidade}
                                            </Badge>
                                            <span className="text-xs font-black text-primary group-hover:scale-110 transition-transform">{appointment.hora}</span>
                                        </div>
                                        <p className="font-bold text-sm text-foreground line-clamp-1">{appointment.tipo}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{appointment.observacao || 'Sem observações'}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-muted-foreground/60">{format(new Date(appointment.data), "dd 'de' MMM", { locale: ptBR })}</span>
                                            {appointment.visibilidade === 'GLOBAL' && (
                                                <span className="text-[9px] font-bold text-primary italic">por {appointment.criador.nome}</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center space-y-4">
                                        <Calendar className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-muted-foreground">Nada agendado</p>
                                            <p className="text-xs text-muted-foreground/60">Tire o dia para focar em prospecção!</p>
                                        </div>
                                        <Button size="sm" className="rounded-xl font-bold bg-primary px-6">Novo Agendamento</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-4 bg-muted/20 border-t border-border/50">
                            <Button variant="outline" className="w-full rounded-xl font-bold text-xs border-border/50 shadow-sm">Ver Agenda Completa</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
