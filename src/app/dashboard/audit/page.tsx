"use client";

import { useState, useEffect, useCallback } from "react";
import {
    History,
    Filter,
    User as UserIcon,
    FileCode,
    RefreshCcw,
    Users,
    LayoutGrid,
    TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MonthYearNavigator } from "@/components/shared/MonthYearNavigator";
import { useDateRangeCompetencia } from "@/hooks/useDateRangeCompetencia";

interface AuditLog {
    id: string;
    timestamp: string;
    modulo: string;
    acao: string;
    usuarioId: string;
    entidadeId?: string;
    ip?: string;
    usuario?: { nome: string };
    detalhes?: string; // Adding details for extra robustness
}

interface AuditStats {
    count24h?: number;
    topModule?: string;
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [availableUsers, setAvailableUsers] = useState<{ id: string, nome: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [filters, setFilters] = useState({
        modulo: "all",
        usuarioId: "",
        startDate: format(new Date(), 'yyyy-MM-01'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    const {
        selectedMonth,
        selectedYear,
        yearOptions,
        onMonthChange,
        onYearChange,
    } = useDateRangeCompetencia({
        startDate: filters.startDate,
        onRangeChange: (range) => {
            setFilters((prev) => ({ ...prev, startDate: range.startDate, endDate: range.endDate }));
        },
    });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users/list');
            if (res.ok) {
                const data = await res.json();
                setAvailableUsers(data);
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Concurrent fetch for logs and stats
            const [logsRes, statsRes] = await Promise.all([
                fetch(`/api/audit?${new URLSearchParams({
                    ...(filters.modulo !== 'all' && { modulo: filters.modulo }),
                    ...(filters.usuarioId && { usuarioId: filters.usuarioId }),
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }).toString()}`),
                fetch('/api/audit?stats=true')
            ]);

            const logsData = await logsRes.json();
            const statsData = await statsRes.json();

            setLogs(logsData);
            setStats(statsData);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro ao sincronizar dados: " + message);
        } finally {
            setLoading(false);
        }
    }, [filters.endDate, filters.modulo, filters.startDate, filters.usuarioId]);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
        fetchUsers();
    }, [fetchData, fetchUsers]);

    const getActionBadgeColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100 font-semibold';
        if (a.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100 font-extrabold shadow-sm';
        if (a.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100 font-semibold';
        if (a.includes('LOGIN_FAILED')) return 'bg-red-600 text-white border-none font-semibold animate-pulse';
        if (a.includes('LOGIN_SUCCESS')) return 'bg-blue-50 text-blue-600 border-blue-100 font-semibold';
        return 'bg-slate-50 text-slate-500 border-slate-100 font-medium';
    };

    const translateModule = (modulo: string) => {
        const translations: Record<string, string> = {
            'CLIENTS': 'Clientes',
            'LOANS': 'Empréstimos',
            'AUTH': 'Autenticação',
            'FINANCIAL': 'Financeiro',
            'COMMISSIONS': 'Comissões',
            'ROLES': 'Perfis',
            'USERS': 'Usuários',
            'AUXILIARY': 'Cadastros',
            'AGENDA': 'Agenda'
        };
        return translations[modulo.toUpperCase()] || modulo;
    };

    const translateAction = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'Criação';
        if (a.includes('DELETE')) return 'Exclusão';
        if (a.includes('UPDATE')) return 'Alteração';
        if (a.includes('LOGIN_FAILED')) return 'Falha de Login';
        if (a.includes('LOGIN_SUCCESS')) return 'Login Sucesso';
        return action.replace(/_/g, ' ');
    };

    const getModuleIcon = (modulo: string) => {
        switch (modulo.toUpperCase()) {
            case 'CLIENTS': return <Users className="h-3.5 w-3.5" />;
            case 'LOANS': return <FileCode className="h-3.5 w-3.5" />;
            case 'AUTH': return <LayoutGrid className="h-3.5 w-3.5" />;
            case 'FINANCIAL': return <TrendingUp className="h-3.5 w-3.5" />;
            default: return <History className="h-3.5 w-3.5" />;
        }
    };

    return (
        <div className="space-y-7 animate-in fade-in duration-500 pb-12">
            {/* ── Senior Management Header ── */}
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0A2F52] to-[#05325E] p-6 md:p-8 border border-white/10 shadow-[0_22px_56px_rgba(5,50,94,0.26)]">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4 text-center lg:text-left">
                        <div className="hidden sm:flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                            <History className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary-foreground leading-tight">Painel de Auditoria</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-xs md:text-sm">Monitoramento senior de integridade e segurança do sistema.</p>
                        </div>
                    </div>
                    {/* Key Metrics */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="ui-lift bg-white/10 backdrop-blur-md rounded-lg p-3 px-5 border border-white/10 min-w-[120px]">
                            <p className="text-[10px] font-medium text-primary-foreground/40 uppercase tracking-widest mb-1.5 leading-none">Atividades (24h)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl md:text-2xl font-semibold text-white leading-none">{stats?.count24h || 0}</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>
                        <div className="ui-lift bg-white/10 backdrop-blur-md rounded-lg p-3 px-5 border border-white/10 min-w-[120px]">
                            <p className="text-[10px] font-medium text-primary-foreground/40 uppercase tracking-widest mb-1.5 leading-none">Módulo Ativo</p>
                            <span className="text-base md:text-lg font-semibold text-amber-400 leading-none">
                                {stats?.topModule ? translateModule(stats.topModule) : '...'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={fetchData}
                    disabled={loading}
                    variant="outline"
                    className="ui-lift ui-focus-ring ui-press gap-2 rounded-lg bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 font-semibold px-6 py-4 h-auto mt-6 w-full lg:w-auto"
                >
                    <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar Logs
                </Button>
            </div>

            {/* Smart Filters Area */}
            <Card className="border border-border/70 shadow-sm overflow-hidden rounded-xl bg-card">
                <CardHeader className="bg-muted/30 border-b border-border/70 p-4 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-3 h-3 text-primary" />
                                Filtrar Módulo
                            </label>
                            <Select value={filters.modulo || "all"} onValueChange={(val) => setFilters(f => ({ ...f, modulo: val }))}>
                                <SelectTrigger className="h-10 ui-focus-ring">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all">Todos os Módulos</SelectItem>
                                    <SelectItem value="CLIENTS">Clientes</SelectItem>
                                    <SelectItem value="LOANS">Empréstimos</SelectItem>
                                    <SelectItem value="COMMISSIONS">Comissões</SelectItem>
                                    <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                                    <SelectItem value="AUTH">Autenticação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Buscar por Operador</label>
                            <Select
                                value={filters.usuarioId || "all"}
                                onValueChange={(val) => setFilters(f => ({ ...f, usuarioId: val === "all" ? "" : val }))}
                            >
                                <SelectTrigger className="h-10 ui-focus-ring">
                                    <SelectValue placeholder="Selecionar Operador" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all">Todos os Operadores</SelectItem>
                                    {availableUsers.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-3">
                            <Button
                                onClick={fetchData}
                                className="ui-lift ui-focus-ring ui-press w-full rounded-lg bg-foreground hover:bg-foreground/90 text-background font-medium uppercase text-xs tracking-widest h-10 shadow-sm"
                            >
                                Filtrar logs
                            </Button>
                        </div>
                        <div className="md:col-span-12 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Navegação Rápida</label>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <MonthYearNavigator
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    yearOptions={yearOptions}
                                    onMonthChange={onMonthChange}
                                    onYearChange={onYearChange}
                                    className="w-full"
                                    monthTriggerClassName="h-10 w-full sm:w-[170px] ui-focus-ring"
                                    monthContentClassName="rounded-lg"
                                    yearNavigatorClassName="w-full sm:w-auto gap-2"
                                    yearSelectTriggerClassName="h-10 w-[112px] ui-focus-ring"
                                    yearSelectContentClassName="rounded-lg"
                                />
                                <div className="h-10 px-3 bg-muted/40 border border-border/70 rounded-lg flex items-center text-sm text-muted-foreground font-medium">
                                    {logs.length} registros filtrados
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent border-b border-border/70">
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em] w-[160px]">Timestamp</TableHead>
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em]">Operador</TableHead>
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em]">Módulo</TableHead>
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em]">Ação Executada</TableHead>
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em]">Referência</TableHead>
                                    <TableHead className="text-[11px] font-medium text-foreground uppercase tracking-[0.12em] text-right">Endereço IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                                                <p className="font-medium uppercase text-[10px] tracking-widest">Cruzando logs de atividade...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40 pt-10">
                                                <div className="h-16 w-16 bg-muted/30 rounded-xl border border-border/70 flex items-center justify-center">
                                                    <Filter className="h-8 w-8 text-muted-foreground/60" />
                                                </div>
                                                <p className="font-medium uppercase text-[10px] tracking-widest">Nenhum evento registrado no critério</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className={cn(
                                            "hover:bg-muted/30 transition-all border-b border-border/50 group",
                                            log.acao.includes('DELETE') ? 'bg-red-50/10' : ''
                                        )}>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                                {new Intl.DateTimeFormat('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                }).format(new Date(log.timestamp))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full bg-muted/30 border border-border/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-foreground uppercase leading-none mb-0.5">{log.usuario?.nome || 'Sistema'}</span>
                                                        <span className="text-[9px] text-muted-foreground font-mono tracking-tighter truncate max-w-[80px]">{log.usuarioId}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-lg w-fit border border-border/70">
                                                    <span className="text-muted-foreground">{getModuleIcon(log.modulo)}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{translateModule(log.modulo)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    getActionBadgeColor(log.acao),
                                                    "px-3 py-1 text-[10px] tracking-tight uppercase border-2"
                                                )}>
                                                    {translateAction(log.acao)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground select-all group-hover:text-foreground">
                                                {log.entidadeId || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-[10px] font-mono select-all">
                                                {log.ip || 'Local'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="bg-muted/30 p-4 border-t border-border/70 flex justify-between items-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.14em]">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> Eventos: {logs.length}</span>
                        <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> {isMounted ? new Date().toLocaleTimeString() : '--:--:--'}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
