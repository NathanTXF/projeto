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
    Search,
    Edit3,
    Trash2,
    Calendar,
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateYearRange, getCurrentYear } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    nome: string;
    usuario: string;
}

interface GoalEntry {
    id?: string;
    mes: number;
    ano: number;
    valor: number;
}

const MONTHS = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
];

export default function GoalsManagementPage() {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Record<number, number>>({});
    const [initialGoals, setInitialGoals] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null); // Month number or null
    const [unauthorized, setUnauthorized] = useState(false);
    const [companyGoal, setCompanyGoal] = useState<number>(0);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchUserGoals();
        }
        fetchConsolidatedGoal();
    }, [selectedUserId, selectedYear]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
                if (data.length > 0) setSelectedUserId(data[0].id);
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserGoals = async () => {
        try {
            const response = await fetch(`/api/admin/goals?userId=${selectedUserId}&year=${selectedYear}`);
            if (response.status === 403) {
                setUnauthorized(true);
                return;
            }
            const data = await response.json();
            const goalsMap: Record<number, number> = {};
            data.userGoals.forEach((g: GoalEntry) => {
                goalsMap[g.mes] = g.valor;
            });
            // Fill missing months with 0
            for (let i = 1; i <= 12; i++) {
                if (goalsMap[i] === undefined) goalsMap[i] = 0;
            }
            setMonthlyGoals(goalsMap);
            setInitialGoals({ ...goalsMap });
        } catch (error) {
            toast.error("Erro ao carregar metas do usuário");
        }
    };

    const fetchConsolidatedGoal = async () => {
        try {
            // Fetch for the current month/year to show in the global card
            const response = await fetch(`/api/admin/goals?month=${now.getMonth() + 1}&year=${selectedYear}`);
            const data = await response.json();
            setCompanyGoal(data.companyGoal || 0);
        } catch (error) {
            console.error("Erro ao buscar meta consolidada:", error);
        }
    };

    const handleGoalChange = (month: number, value: string) => {
        const numVal = value === "" ? 0 : parseInt(value);
        setMonthlyGoals(prev => ({ ...prev, [month]: numVal }));
    };

    const saveGoal = async (month: number) => {
        setSaving(month);
        try {
            const response = await fetch('/api/admin/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'user',
                    id: selectedUserId,
                    value: monthlyGoals[month],
                    month,
                    year: parseInt(selectedYear)
                })
            });
            if (response.ok) {
                setInitialGoals(prev => ({ ...prev, [month]: monthlyGoals[month] }));
                toast.success(`Meta de ${MONTHS.find(m => m.value === month)?.label} salva!`);
                fetchConsolidatedGoal();
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error("Erro ao salvar meta");
        } finally {
            setSaving(null);
        }
    };

    const deleteGoal = async (month: number) => {
        if (!confirm(`Deseja realmente excluir a meta de ${MONTHS.find(m => m.value === month)?.label}?`)) return;

        setSaving(month);
        try {
            const response = await fetch('/api/admin/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'user',
                    id: selectedUserId,
                    month,
                    year: parseInt(selectedYear),
                    action: 'delete'
                })
            });
            if (response.ok) {
                setMonthlyGoals(prev => ({ ...prev, [month]: 0 }));
                setInitialGoals(prev => ({ ...prev, [month]: 0 }));
                toast.success(`Meta de ${MONTHS.find(m => m.value === month)?.label} removida!`);
                fetchConsolidatedGoal();
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error("Erro ao excluir meta");
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <Target className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Gestão de Metas</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Configure os objetivos de vendas anuais por colaborador.</p>
                        </div>
                    </div>

                    {/* Period & User Selector */}
                    <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-white/70" />
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="w-[200px] h-9 bg-white/10 border-white/20 text-white rounded-lg focus:ring-0 text-xs px-2 hover:bg-white/20 transition-all">
                                    <SelectValue placeholder="Selecionar Usuário" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-active">
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id} className="rounded-lg text-xs">{u.nome} (@{u.usuario})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-white/70" />
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[100px] h-9 bg-white/10 border-white/20 text-white rounded-lg focus:ring-0 text-xs px-2 hover:bg-white/20 transition-all">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-active">
                                    {generateYearRange(getCurrentYear(), 1, 2).map(y => (
                                        <SelectItem key={y} value={y.toString()} className="rounded-lg text-xs">{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Company Global Goal ── */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-slate-900 text-white relative h-full transition-all duration-500 hover:shadow-primary/5">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
                        <CardHeader className="relative p-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl font-black">Meta Global Consolidada</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-medium font-sans">
                                Meta somada de todos os consultores para o mês atual de {now.toLocaleDateString('pt-BR', { month: 'long' })}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative p-8 pt-0 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alvo Total do Período</label>
                                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl transition-all hover:bg-white/[0.07]">
                                    <div className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                                        {companyGoal}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tight">Contratos</span>
                                        <Badge variant="outline" className="mt-1 border-white/20 text-white/40 text-[9px] font-bold px-2 py-0 h-5">
                                            <Lock className="h-2.5 w-2.5 mr-1 opacity-50" />
                                            Automático
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-4 transition-all hover:bg-primary/[0.15]">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                    <Info className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-[11px] text-slate-300 font-medium leading-relaxed font-sans">
                                    <strong className="text-white block mb-1">Dica Estratégica</strong>
                                    Altere as metas individuais para que o sistema recalcule automaticamente a meta global da empresa.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── 12 Months Grid ── */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-xl rounded-3xl bg-card h-full flex flex-col overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">Planejamento Anual - {selectedYear}</CardTitle>
                                    <CardDescription>
                                        Vendedor: <span className="font-bold text-foreground">{users.find(u => u.id === selectedUserId)?.nome || "..."}</span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px]">
                            <div className="divide-y divide-border/40">
                                {MONTHS.map((m) => {
                                    const currentVal = monthlyGoals[m.value] || 0;
                                    const hasChanged = currentVal !== initialGoals[m.value];
                                    const isSaving = saving === m.value;

                                    return (
                                        <div key={m.value} className={cn(
                                            "p-4 px-8 flex items-center justify-between hover:bg-muted/30 transition-all",
                                            hasChanged && "bg-primary/5"
                                        )}>
                                            <div className="flex items-center gap-4 w-32">
                                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{m.label.substring(0, 3)}</div>
                                                <div className="text-xs font-medium text-muted-foreground/60">{m.label}</div>
                                            </div>

                                            <div className="flex-1 flex items-center justify-end gap-4">
                                                <div className="relative group">
                                                    <Input
                                                        type="number"
                                                        value={currentVal}
                                                        onChange={(e) => handleGoalChange(m.value, e.target.value)}
                                                        className={cn(
                                                            "h-10 w-28 rounded-xl border-border/60 font-black text-sm text-center focus:ring-primary/20",
                                                            hasChanged && "border-primary border-2"
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={!hasChanged || isSaving}
                                                        onClick={() => saveGoal(m.value)}
                                                        className="h-9 w-9 p-0 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                                                        title="Salvar"
                                                    >
                                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={isSaving || currentVal === 0}
                                                        onClick={() => deleteGoal(m.value)}
                                                        className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

