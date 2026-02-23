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
    CheckCircle2
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

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/admin/goals');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
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
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <Target className="h-8 w-8 text-primary" />
                    Gestão de Metas
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Configure os objetivos financeiros da empresa e de cada colaborador.
                </p>
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
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-xl font-black tracking-tight">Metas por Colaborador</CardTitle>
                                    </div>
                                    <CardDescription>Defina a meta individual de comissões para cada vendedor.</CardDescription>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black px-3 py-1 text-[10px] rounded-full uppercase tracking-tighter">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Baseado em Comissões
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1">
                            <div className="divide-y divide-border/40">
                                {userGoals.map((u) => (
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

                                            <div className="flex items-center gap-3 md:min-w-[280px]">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground/40">R$</span>
                                                    <Input
                                                        type="number"
                                                        defaultValue={u.goal}
                                                        onBlur={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (val !== u.goal) updateGoal('user', u.id, val);
                                                        }}
                                                        className="pl-8 h-12 rounded-xl border-border/60 font-black text-sm focus:ring-primary/20"
                                                        placeholder="Vazio"
                                                    />
                                                </div>
                                                <div className={cn(
                                                    "h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 opacity-0 group-focus-within:opacity-100 transition-opacity",
                                                    saving === u.id && "opacity-100"
                                                )}>
                                                    {saving === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
