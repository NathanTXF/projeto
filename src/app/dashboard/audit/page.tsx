"use client";

import { useState, useEffect } from "react";
import {
    History,
    Search,
    Filter,
    User as UserIcon,
    FileCode,
    Calendar as CalendarIcon,
    ChevronRight,
    RefreshCcw,
    Users,
    LayoutGrid,
    TrendingUp,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [filters, setFilters] = useState({
        modulo: "all",
        usuarioId: "",
        startDate: format(new Date(), 'yyyy-MM-01'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
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
        } catch (error: any) {
            toast.error("Erro ao sincronizar dados: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadgeColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold';
        if (a.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100 font-extrabold shadow-sm';
        if (a.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100 font-bold';
        if (a.includes('LOGIN_FAILED')) return 'bg-red-600 text-white border-none font-black animate-pulse';
        if (a.includes('LOGIN_SUCCESS')) return 'bg-blue-50 text-blue-600 border-blue-100 font-bold';
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Senior Management Header ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-6 md:p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4 text-center lg:text-left">
                        <div className="hidden sm:flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <History className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Painel de Auditoria</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-xs md:text-sm">Monitoramento senior de integridade e segurança do sistema.</p>
                        </div>
                    </div>
                    {/* Key Metrics */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 border border-white/10 min-w-[120px]">
                            <p className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest mb-1.5 leading-none">Atividades (24h)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl md:text-2xl font-black text-white leading-none">{stats?.count24h || 0}</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 border border-white/10 min-w-[120px]">
                            <p className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest mb-1.5 leading-none">Módulo Ativo</p>
                            <span className="text-base md:text-lg font-black text-amber-400 leading-none">
                                {stats?.topModule ? translateModule(stats.topModule) : '...'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={fetchData}
                    disabled={loading}
                    variant="outline"
                    className="gap-2 rounded-xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-all font-bold px-6 py-4 h-auto active:scale-95 mt-6 w-full lg:w-auto"
                >
                    <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar Logs
                </Button>
            </div>

            {/* Smart Filters Area */}
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-3 h-3 text-indigo-500" />
                                Filtrar Módulo
                            </label>
                            <Select value={filters.modulo} onValueChange={(val) => setFilters(f => ({ ...f, modulo: val }))}>
                                <SelectTrigger className="rounded-xl bg-white h-11 font-bold border-slate-200 shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Todos os Módulos</SelectItem>
                                    <SelectItem value="CLIENTS">Clientes</SelectItem>
                                    <SelectItem value="LOANS">Empréstimos</SelectItem>
                                    <SelectItem value="COMMISSIONS">Comissões</SelectItem>
                                    <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                                    <SelectItem value="AUTH">Autenticação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-4 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início</label>
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl bg-white border-slate-200 font-bold"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fim</label>
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl bg-white border-slate-200 font-bold"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Buscar por UUID</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="ID do Usuário..."
                                    className="pl-9 h-11 rounded-xl bg-white border-slate-200 font-medium"
                                    value={filters.usuarioId}
                                    onChange={(e) => setFilters(f => ({ ...f, usuarioId: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Button
                                onClick={fetchData}
                                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest h-11 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                Filtrar logs
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-b border-slate-100">
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest w-[160px]">Timestamp</TableHead>
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Operador</TableHead>
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Módulo</TableHead>
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ação Executada</TableHead>
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Referência</TableHead>
                                    <TableHead className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Endereço IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                                                <p className="font-black uppercase text-[10px] tracking-widest">Cruzando logs de atividade...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40 pt-10">
                                                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                                                    <Filter className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="font-black uppercase text-[10px] tracking-widest">Nenhum evento registrado no critério</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className={cn(
                                            "hover:bg-slate-50/80 transition-all border-b border-slate-50 group",
                                            log.acao.includes('DELETE') ? 'bg-red-50/10' : ''
                                        )}>
                                            <TableCell className="font-mono text-[10px] text-slate-500 font-bold whitespace-nowrap">
                                                {new Intl.DateTimeFormat('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                }).format(new Date(log.timestamp))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <UserIcon className="h-3.5 w-3.5 text-slate-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-800 uppercase leading-none mb-0.5">{log.usuario?.nome || 'Sistema'}</span>
                                                        <span className="text-[9px] text-slate-400 font-mono tracking-tighter truncate max-w-[80px]">{log.usuarioId}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg w-fit border border-slate-200/50">
                                                    <span className="text-slate-500">{getModuleIcon(log.modulo)}</span>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{translateModule(log.modulo)}</span>
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
                                            <TableCell className="font-mono text-[10px] text-slate-400 select-all group-hover:text-slate-600">
                                                {log.entidadeId || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 text-[10px] font-mono select-all">
                                                {log.ip || 'Local'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> Eventos: {logs.length}</span>
                        <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> {isMounted ? new Date().toLocaleTimeString() : '--:--:--'}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
