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
import { Filter, Users as UsersIcon, Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Comissões</h1>
                    <p className="text-slate-500 mt-1">
                        Gestão e aprovação de comissões por período e vendedor.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setPeriod("all"); setVendedorId("all"); }} className="gap-2 rounded-xl transition-all hover:bg-slate-50">
                        <RefreshCcw className="h-4 w-4" />
                        Limpar Filtros
                    </Button>
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
