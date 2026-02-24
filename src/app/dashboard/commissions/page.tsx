"use client";

import { useState, useEffect } from "react";
import { CommissionList } from "@/modules/commissions/presentation/components/CommissionList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, Coins, Users as UsersIcon, Calendar as CalendarIcon, RefreshCcw, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/ExportButton";
import { exportToCsv, exportToPdf, ExportColumn } from "@/lib/exportUtils";

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<string>("all");
    const [vendedorId, setVendedorId] = useState<string>("all");

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Erro ao carregar vendedores", error);
        }
    };

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            let url = "/api/commissions";
            const params = new URLSearchParams();
            if (period !== "all") params.append("mesAno", period);
            if (vendedorId !== "all") params.append("vendedorId", vendedorId);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCommissions(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar comissões");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchCommissions();
    }, [period, vendedorId]);

    const handleApprove = async (id: string, data?: any) => {
        try {
            if (id.startsWith('pending-')) {
                // Criar nova comissão
                const response = await fetch("/api/commissions", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const commission = await response.json();
                    // Após criar, aprovar automaticamente (ou o POST já faz isso?)
                    // O MVP diz que ao aprovar, vai para o financeiro.
                    // Vou fazer o POST ja criar como APROVADO se vier da UI de aprovação, 
                    // ou fazer um PATCH logo em seguida.
                    // Melhorei o backend para o POST suportar status opcional.
                    const approveRes = await fetch(`/api/commissions/${commission.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "APPROVE" }),
                        headers: { "Content-Type": "application/json" },
                    });

                    if (approveRes.ok) {
                        toast.success("Comissão gerada e aprovada!");
                        fetchCommissions();
                    }
                }
            } else {
                const response = await fetch(`/api/commissions/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ action: "APPROVE" }),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    toast.success("Comissão aprovada!");
                    fetchCommissions();
                }
            }
        } catch (error) {
            toast.error("Erro ao processar comissão");
        }
    };

    const handleCancel = async (id: string) => {
        try {
            const response = await fetch(`/api/commissions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "CANCEL" }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                toast.success("Comissão cancelada");
                fetchCommissions();
            }
        } catch (error) {
            toast.error("Erro ao cancelar comissão");
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const totalAprovado = commissions.filter(c => c.status === 'APROVADO').reduce((acc, c) => acc + Number(c.valorCalculado), 0);
    const totalPendente = commissions.filter(c => c.status === 'EM_ABERTO').reduce((acc, c) => acc + Number(c.valorCalculado), 0);

    const exportColumns: ExportColumn<any>[] = [
        { header: "Cód.", accessor: (c) => c.cod || "-" },
        { header: "Vendedor", accessor: (c) => c.vendedorNome || "-" },
        { header: "Cliente", accessor: (c) => c.clienteNome || "-" },
        { header: "Regra Comiss.", accessor: (c) => c.tipoComissao || "-" },
        { header: "Valor Base (Venda)", accessor: (c) => `R$ ${Number(c.valorBase || 0).toFixed(2)}` },
        { header: "Comissão Gerada", accessor: (c) => `R$ ${Number(c.valorCalculado || 0).toFixed(2)}` },
        { header: "Aprovado Em", accessor: (c) => c.aprovadoEm ? new Date(c.aprovadoEm).toLocaleDateString('pt-BR') : "-" },
        { header: "Criado Em", accessor: (c) => c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : "-" },
        { header: "Status", accessor: (c) => c.status || "-" }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <Coins className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Comissões</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">
                                Gestão e aprovação de comissões por período e vendedor.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <ExportButton
                            onExportCsv={() => exportToCsv("comissoes", exportColumns, commissions)}
                            onExportPdf={() => exportToPdf("Relatório de Comissões", "comissoes", exportColumns, commissions)}
                        />
                        <Button
                            variant="outline"
                            onClick={() => { setPeriod("all"); setVendedorId("all"); }}
                            className="gap-2 rounded-xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all font-bold px-6 py-3 h-auto"
                        >
                            <RefreshCcw className="h-5 w-5" />
                            Limpar Filtros
                        </Button>
                    </div>
                </div>
                {/* Mini stats */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Aprovado</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{formatCurrency(totalAprovado)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <Clock className="h-6 w-6 text-amber-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Pendente</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{formatCurrency(totalPendente)}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <Filter className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Registros</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : commissions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-4 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <CalendarIcon className="h-4 w-4" />
                                Período (Mês/Ano)
                            </Label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-white shadow-sm h-12">
                                    <SelectValue placeholder="Todos os períodos" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Todos os períodos</SelectItem>
                                    <SelectItem value="02/2026">02/2026</SelectItem>
                                    <SelectItem value="01/2026">01/2026</SelectItem>
                                    <SelectItem value="12/2025">12/2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <UsersIcon className="h-4 w-4" />
                                Vendedor
                            </Label>
                            <Select value={vendedorId} onValueChange={setVendedorId}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-white shadow-sm h-12">
                                    <SelectValue placeholder="Todos os vendedores" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Todos os vendedores</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <div className="w-full h-12 px-4 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center justify-center text-sm text-blue-600 font-bold">
                                <Filter className="h-4 w-4 mr-2" />
                                {commissions.length} registros encontrados
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-24 w-24 text-emerald-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total a Pagar (Aprovado)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-600 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'APROVADO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Comissões aprovadas para os filtros atuais</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock className="h-24 w-24 text-amber-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Pendente (Em Aberto)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-500 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'EM_ABERTO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Aguardando aprovação</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-slate-400 font-medium">Carregando dados...</p>
                        </div>
                    ) : (
                        <CommissionList
                            commissions={commissions}
                            onApprove={handleApprove}
                            onCancel={handleCancel}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
