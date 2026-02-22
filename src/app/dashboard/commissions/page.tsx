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

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/commissions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "APPROVE" }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                toast.success("Comissão aprovada!");
                fetchCommissions();
            }
        } catch (error) {
            toast.error("Erro ao aprovar comissão");
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
                </div>
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                            <Coins className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Comissões</h1>
                            <p className="mt-1 text-blue-100/90 font-medium">
                                Gestão e aprovação de comissões por período e vendedor.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => { setPeriod("all"); setVendedorId("all"); }}
                        className="gap-2 rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all font-medium"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
                {/* Mini stats */}
                <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Aprovado</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(totalAprovado)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <Clock className="h-5 w-5 text-amber-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Pendente</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(totalPendente)}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <Filter className="h-5 w-5 text-blue-200" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Registros</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : commissions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                <CalendarIcon className="h-3 w-3" />
                                Período (Mês/Ano)
                            </Label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                    <SelectValue placeholder="Todos os períodos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os períodos</SelectItem>
                                    {/* Exemplo de períodos recentes. Poderia ser dinâmico. */}
                                    <SelectItem value="02/2026">02/2026</SelectItem>
                                    <SelectItem value="01/2026">01/2026</SelectItem>
                                    <SelectItem value="12/2025">12/2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                <UsersIcon className="h-3 w-3" />
                                Vendedor
                            </Label>
                            <Select value={vendedorId} onValueChange={setVendedorId}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                    <SelectValue placeholder="Todos os vendedores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os vendedores</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <div className="w-full p-2 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
                                <Filter className="h-3 w-3 mr-2" />
                                {commissions.length} registros encontrados
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-emerald-50 border-emerald-100 shadow-sm rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <div className="h-16 w-16 bg-emerald-600 rounded-full" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-emerald-900/60">Total a Pagar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700 font-outfit">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'APROVADO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1 font-medium italic">Comissões aprovadas para os filtros atuais</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-100 shadow-sm rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <div className="h-16 w-16 bg-amber-600 rounded-full" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-900/60">Pendente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700 font-outfit">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'EM_ABERTO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-amber-600 mt-1 font-medium italic">Aguardando aprovação</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-lg overflow-hidden rounded-2xl">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle>Listagem de Comissões</CardTitle>
                    <CardDescription>Visualize e gerencie os pagamentos conforme os filtros selecionados.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
