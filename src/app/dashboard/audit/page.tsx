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
    RefreshCcw
} from "lucide-react";
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

interface AuditLog {
    id: string;
    timestamp: string;
    modulo: string;
    acao: string;
    usuarioId: string;
    entidadeId?: string;
    ip?: string;
    usuario?: { nome: string };
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        modulo: "all",
        usuarioId: "",
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.modulo !== "all") queryParams.append("modulo", filters.modulo);
            if (filters.usuarioId) queryParams.append("usuarioId", filters.usuarioId);

            const response = await fetch(`/api/audit?${queryParams.toString()}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setLogs(data);
        } catch (error: any) {
            toast.error("Erro ao carregar auditoria: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none';
        if (action.includes('DELETE')) return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-none';
        if (action.includes('UPDATE')) return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none';
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-none';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <History className="h-8 w-8 text-indigo-600" />
                        Auditoria do Sistema
                    </h1>
                    <p className="text-slate-500 mt-1">Rastreamento completo de atividades e mudanças.</p>
                </div>
                <Button onClick={fetchLogs} variant="outline" className="gap-2 rounded-xl transition-all hover:bg-slate-50 shadow-sm">
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4 flex-wrap">
                            <div className="w-48">
                                <Select value={filters.modulo} onValueChange={(val) => setFilters(f => ({ ...f, modulo: val }))}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Módulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Módulos</SelectItem>
                                        <SelectItem value="CLIENTS">Clientes</SelectItem>
                                        <SelectItem value="LOANS">Empréstimos</SelectItem>
                                        <SelectItem value="COMMISSIONS">Comissões</SelectItem>
                                        <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                                        <SelectItem value="AUTH">Autenticação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex bg-white rounded-xl border border-slate-200 px-3 py-1 items-center gap-2 shadow-sm">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    placeholder="Filtrar por Usuário ID..."
                                    className="border-none focus:outline-none text-sm w-40"
                                    value={filters.usuarioId}
                                    onChange={(e) => setFilters(f => ({ ...f, usuarioId: e.target.value }))}
                                />
                            </div>
                        </div>
                        <Button onClick={fetchLogs} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <Filter className="h-4 w-4 mr-2" />
                            Aplicar Filtros
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/30">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700 w-[180px]">Data/Hora</TableHead>
                                <TableHead className="font-semibold text-slate-700">Usuário</TableHead>
                                <TableHead className="font-semibold text-slate-700">Módulo</TableHead>
                                <TableHead className="font-semibold text-slate-700">Ação</TableHead>
                                <TableHead className="font-semibold text-slate-700">Entidade ID</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                        Buscando logs de auditoria...
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                                        Nenhum registro encontrado para os filtros selecionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <TableCell className="text-slate-600 font-mono text-xs">
                                            {new Intl.DateTimeFormat('pt-BR', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            }).format(new Date(log.timestamp))}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <UserIcon className="h-3 w-3 text-slate-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{log.usuario?.nome || 'Sistema'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 uppercase text-[10px] font-bold">
                                                {log.modulo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getActionBadgeColor(log.acao)}>
                                                {log.acao}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 font-mono text-[10px] truncate max-w-[120px]">
                                            {log.entidadeId || '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 text-xs">
                                            {log.ip || 'Local'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-end pr-4 text-xs text-slate-400 gap-4">
                <span className="flex items-center gap-1"><FileCode className="h-3 w-3" /> Registros: {logs.length}</span>
                <span className="flex items-center gap-1"><History className="h-3 w-3" /> Última atualização: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
}
