"use client";

import { useState, useEffect } from "react";
import {
    Target,
    Users,
    Building2,
    Save,
    TrendingUp,
    Loader2,
    Info,
    CheckCircle2,
    Lock,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserGoal {
    id: string;
    name: string;
    username: string;
    goal: number;
    isAdmin: boolean;
}

export default function GoalsManagementPage() {
    const [companyGoal, setCompanyGoal] = useState<number>(0);
    const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // 'company' or user.id
    const [searchTerm, setSearchTerm] = useState("");
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/admin/goals');
            if (response.status === 403) {
                setUnauthorized(true);
                return;
            }
            const data = await response.json();
            if (data.error) {
                if (data.error === 'Não autorizado') {
                    setUnauthorized(true);
                    return;
                }
                throw new Error(data.error);
            }
            setCompanyGoal(data.companyGoal);
            setUserGoals(data.userGoals);
        } catch (error: any) {
            toast.error("Erro ao carregar metas: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateGoal = async (type: 'company' | 'user', id?: string, value?: number) => {
        const targetId = id || 'company';
        setSaving(targetId);
        try {
            const response = await fetch('/api/admin/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, value })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            toast.success("Meta atualizada com sucesso!");
            if (type === 'user') {
                setUserGoals(prev => prev.map(u => u.id === id ? { ...u, goal: value! } : u));
            }
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center animate-in fade-in duration-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center shadow-inner">
                    <Lock className="h-12 w-12 text-red-500 mb-1" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Acesso Restrito</h2>
                    <p className="text-muted-foreground font-medium">
                        Você não tem permissão para visualizar ou gerenciar as metas da empresa. Esta área é restrita a administradores.
                    </p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()} className="mt-4 hover:bg-muted font-bold">
                    Voltar
                </Button>
            </div>
        );
    }

    const filteredUsers = userGoals.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
                <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                        <Target className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Gestão de Metas</h1>
                        <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Configure os objetivos financeiros da empresa e de cada colaborador.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Company Global Goal ── */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-slate-900 text-white relative h-full">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
                        <CardHeader className="relative p-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl font-black">Meta de Vendas Global</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-medium">
                                Objetivo total de crédito bruto liquidado pela empresa no mês.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative p-8 pt-0 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Valor Bruto (R$)</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={companyGoal}
                                        onChange={(e) => setCompanyGoal(Number(e.target.value))}
                                        className="bg-white/5 border-white/10 text-white font-black text-2xl h-16 rounded-2xl focus:ring-primary/50"
                                    />
                                    <Button
                                        onClick={() => updateGoal('company', undefined, companyGoal)}
                                        disabled={saving === 'company'}
                                        className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center p-0 shrink-0"
                                    >
                                        {saving === 'company' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    Esta meta é usada para calcular a performance do painel estratégico ("Visão 360º").
                                    A meta padrão atual é de R$ 50.000,00.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Individual User Goals ── */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-xl rounded-3xl bg-card h-full flex flex-col">
                        <CardHeader className="p-8 pb-6 border-b border-border/40">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-xl font-black tracking-tight">Metas por Colaborador</CardTitle>
                                    </div>
                                    <CardDescription>Defina a meta individual de comissões para cada vendedor.</CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="hidden md:flex bg-emerald-500/10 text-emerald-600 border-none font-black px-3 py-1 text-[10px] rounded-full uppercase tracking-tighter">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Baseado em Comissões
                                    </Badge>
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar vendedor..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-10 w-full md:w-[220px] rounded-xl bg-muted/40 border-none focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1">
                            <div className="divide-y divide-border/40">
                                {filteredUsers.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                        <p className="text-muted-foreground font-medium">Nenhum colaborador encontrado.</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <div key={u.id} className="py-6 first:pt-2 last:pb-2 group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-foreground flex items-center gap-2">
                                                            {u.name}
                                                            {u.isAdmin && <Badge variant="secondary" className="h-5 text-[8px] font-black uppercase tracking-tighter">Admin</Badge>}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-muted-foreground/60 tracking-tight">@{u.username}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 md:min-w-[320px]">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground/40">R$</span>
                                                        <Input
                                                            type="number"
                                                            defaultValue={u.goal}
                                                            id={`input-goal-${u.id}`}
                                                            className="pl-8 h-12 rounded-xl border-border/60 font-black text-sm focus:ring-primary/20"
                                                            placeholder="0,00"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const el = document.getElementById(`input-goal-${u.id}`) as HTMLInputElement;
                                                            if (el) {
                                                                const val = Number(el.value);
                                                                updateGoal('user', u.id, val);
                                                            }
                                                        }}
                                                        disabled={saving === u.id}
                                                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-4 rounded-xl shadow-md"
                                                    >
                                                        {saving === u.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                        Salvar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
